/**
 * Tiptap Rich Text Editor Component
 * 基于 Tiptap 的富文本编辑器组件
 */

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ResizableImage } from "tiptap-extension-resizable-image";
import "tiptap-extension-resizable-image/styles.css";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { useCallback, useState, useEffect, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import uploadService from "@shared/services/upload.service";
import { cn } from "@shared/utils/helpers";
import { Modal, Input, Button } from "@shared/components";

export function TiptapEditor({
  value = "",
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  height = 400,
  className,
}) {
  const { t } = useTranslation();
  const finalPlaceholder =
    placeholder || t("components.editor.placeholder", "내용을 입력하세요...");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkMode, setLinkMode] = useState("edit");
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const contextMenuRef = useRef(null);
  const editorWrapperRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 确保历史记录功能正常
        history: {
          depth: 100,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      ResizableImage.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300 my-4 w-full",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "bg-gray-100 font-semibold border border-gray-300 px-3 py-2",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-3 py-2",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          "max-w-none focus:outline-none p-4 [&_p]:my-0 [&_p]:leading-normal [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-2 [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:list-disc [&_ol]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_li]:my-0 [&_li_p]:my-0 [&_img]:max-w-full [&_img]:h-auto [&_img]:cursor-pointer [&_.ProseMirror-selectednode]:ring-2 [&_.ProseMirror-selectednode]:ring-blue-500",
      },
      handleDOMEvents: {
        contextmenu: (view, event) => {
          const { state } = view;
          const { selection } = state;
          const $head = selection.$head;
          let inTable = false;
          for (let d = $head.depth; d > 0; d--) {
            if ($head.node(d).type.name === 'table') { inTable = true; break; }
          }
          if (inTable) {
            event.preventDefault();
            setContextMenu({
              visible: true,
              x: event.clientX,
              y: event.clientY,
            });
            return true;
          }
          return false;
        },
      },
    },
  });

  // 图片上传处理
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsUploading(true);
        setUploadProgress(0);

        // 使用 uploadPublic 方法上传图片，带进度回调
        const response = await uploadService.uploadPublic(
          file,
          (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          },
        );

        if (response?.fileUrl && editor) {
          editor
            .chain()
            .focus()
            .setResizableImage({ src: response.fileUrl })
            .run();
        } else if (response?.url && editor) {
          editor.chain().focus().setResizableImage({ src: response.url }).run();
        } else {
          throw new Error("上传响应格式错误");
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("图片上传失败: " + (error.message || "请重试"));
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

    input.click();
  }, [editor]);

  // 添加链接
  const handleAddLink = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, "");
    const previousUrl = editor.getAttributes("link").href || "";
    const isActiveLink = editor.isActive("link");
    const isInsertMode = !selectedText && !isActiveLink;

    setLinkText(selectedText);
    setLinkUrl(previousUrl);
    setLinkMode(isInsertMode ? "insert" : "edit");
    setShowLinkModal(true);
  }, [editor]);

  // 确认添加链接
  const handleConfirmLink = useCallback(() => {
    if (!editor) return;

    const trimmedUrl = linkUrl.trim();
    const trimmedText = linkText.trim();
    const chain = editor.chain().focus().extendMarkRange("link");

    if (!trimmedUrl) {
      chain.unsetLink().run();
    } else {
      let finalUrl = trimmedUrl;
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = "https://" + finalUrl;
      }

      if (linkMode === "insert") {
        const nextText = trimmedText || finalUrl;
        editor
          .chain()
          .focus()
          .insertContent({
            type: "text",
            text: nextText,
            marks: [{ type: "link", attrs: { href: finalUrl } }],
          })
          .run();
      } else {
        chain.setLink({ href: finalUrl }).run();
      }
    }

    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
    setLinkMode("edit");
  }, [editor, linkMode, linkText, linkUrl]);

  // 关闭右键菜单
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };
    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu.visible]);

  useLayoutEffect(() => {
    if (!contextMenu.visible || !contextMenuRef.current) {
      return;
    }

    const menuRect = contextMenuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 12;

    let nextX = contextMenu.x;
    let nextY = contextMenu.y;

    if (nextX + menuRect.width > viewportWidth - padding) {
      nextX = Math.max(padding, viewportWidth - menuRect.width - padding);
    }

    if (nextY + menuRect.height > viewportHeight - padding) {
      nextY = Math.max(padding, contextMenu.y - menuRect.height);
    }

    if (nextY + menuRect.height > viewportHeight - padding) {
      nextY = Math.max(padding, viewportHeight - menuRect.height - padding);
    }

    setContextMenuPosition({ x: nextX, y: nextY });
  }, [contextMenu]);

  // 表格整体拖拽调整大小
  useEffect(() => {
    const wrapper = editorWrapperRef.current;
    if (!wrapper) return;

    const HANDLE_SIZE = 8;

    const createHandle = (type) => {
      const el = document.createElement('div');
      el.className = `table-resize-handle table-resize-${type}`;
      el.dataset.resizeType = type;
      return el;
    };

    const attachHandles = () => {
      const tableWrappers = wrapper.querySelectorAll('.ProseMirror .tableWrapper');
      tableWrappers.forEach((tw) => {
        if (tw.dataset.resizeReady) return;
        tw.dataset.resizeReady = 'true';
        tw.style.position = 'relative';
        tw.appendChild(createHandle('right'));
        tw.appendChild(createHandle('bottom'));
        tw.appendChild(createHandle('corner'));
      });
    };

    // 初始 + MutationObserver 监听新表格
    attachHandles();
    const observer = new MutationObserver(attachHandles);
    observer.observe(wrapper, { childList: true, subtree: true });

    // 拖拽逻辑
    let resizing = null;

    const handleMouseDown = (e) => {
      const handle = e.target.closest('[data-resize-type]');
      if (!handle) return;
      const tw = handle.closest('.tableWrapper');
      if (!tw) return;

      e.preventDefault();
      e.stopPropagation();
      const type = handle.dataset.resizeType;
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = tw.offsetWidth;
      const startH = tw.offsetHeight;
      resizing = { tw, type, startX, startY, startW, startH };

      const cursorMap = { right: 'col-resize', bottom: 'row-resize', corner: 'nwse-resize' };
      document.body.style.cursor = cursorMap[type];
      document.body.style.userSelect = 'none';
      tw.classList.add('is-resizing');
    };

    const handleMouseMove = (e) => {
      if (!resizing) return;
      const { tw, type, startX, startY, startW, startH } = resizing;
      if (type === 'right' || type === 'corner') {
        tw.style.width = Math.max(100, startW + e.clientX - startX) + 'px';
      }
      if (type === 'bottom' || type === 'corner') {
        tw.style.height = Math.max(40, startH + e.clientY - startY) + 'px';
      }
    };

    const handleMouseUp = () => {
      if (resizing) {
        resizing.tw.classList.remove('is-resizing');
        resizing = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    wrapper.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      observer.disconnect();
      wrapper.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // 同步外部 value 变化到编辑器
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      queueMicrotask(() => {
        editor.commands.setContent(value || "");
      });
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  // 右键菜单操作
  const runTableAction = useCallback((action) => {
    if (!editor) return;
    editor.chain().focus()[action]().run();
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, [editor]);

  return (
    <div
      ref={editorWrapperRef}
      className={cn("tiptap-editor-wrapper relative overflow-visible", className)}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* 工具栏 - 简洁版 */}
      <div className="border border-gray-300 rounded-t-lg bg-white border-b-0 p-3 flex items-center gap-2 shadow-sm">
        {/* 文本格式组 */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 transition-colors",
              editor.isActive("bold") && "bg-blue-100 text-blue-600",
            )}
            title={t("components.editor.bold", "굵게")}
          >
            <strong className="text-sm">B</strong>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 transition-colors",
              editor.isActive("italic") && "bg-blue-100 text-blue-600",
            )}
            title={t("components.editor.italic", "기울임")}
          >
            <em className="text-sm">I</em>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 transition-colors",
              editor.isActive("underline") && "bg-blue-100 text-blue-600",
            )}
            title={t("components.editor.underline", "밑줄")}
          >
            <u className="text-sm">U</u>
          </button>
        </div>

        {/* 标题组 */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={cn(
              "px-2 h-8 flex items-center justify-center rounded text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors",
              editor.isActive("heading", { level: 1 }) &&
                "bg-blue-100 text-blue-600",
            )}
            title={t("components.editor.heading1", "제목 1")}
          >
            H1
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              "px-2 h-8 flex items-center justify-center rounded text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors",
              editor.isActive("heading", { level: 2 }) &&
                "bg-blue-100 text-blue-600",
            )}
            title={t("components.editor.heading2", "제목 2")}
          >
            H2
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={cn(
              "px-2 h-8 flex items-center justify-center rounded text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors",
              editor.isActive("heading", { level: 3 }) &&
                "bg-blue-100 text-blue-600",
            )}
            title={t("components.editor.heading3", "제목 3")}
          >
            H3
          </button>
        </div>

        {/* 列表组 */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 transition-colors",
              editor.isActive("bulletList") && "bg-blue-100 text-blue-600",
            )}
            title={t("components.editor.bulletList", "글머리 기호 목록")}
          >
            <span className="text-lg">•</span>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 transition-colors",
              editor.isActive("orderedList") && "bg-blue-100 text-blue-600",
            )}
            title={t("components.editor.orderedList", "번호 매기기 목록")}
          >
            <span className="text-sm">1.</span>
          </button>
        </div>

        {/* 插入组 */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            type="button"
            onClick={handleAddLink}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 transition-colors",
              editor.isActive("link") && "bg-blue-100 text-blue-600",
            )}
            title={t("components.editor.link", "링크")}
          >
            <span className="text-base">🔗</span>
          </button>

          <button
            type="button"
            onClick={handleImageUpload}
            className="w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 transition-colors"
            title={t("components.editor.image", "이미지")}
          >
            <span className="text-base">🖼️</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTableModal(true)}
            className="w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 transition-colors"
            title={t("components.editor.table", "표")}
          >
            <span className="text-base">📊</span>
          </button>
        </div>

        {/* 操作组 */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={t("components.editor.undo", "실행 취소")}
          >
            <span className="text-lg">↶</span>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="w-8 h-8 flex items-center justify-center rounded text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={t("components.editor.redo", "다시 실행")}
          >
            <span className="text-lg">↷</span>
          </button>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className={cn(
            "border border-t-0 border-gray-300 rounded-b-lg bg-white overflow-y-auto",
            error && "border-red-500",
          )}
          style={{ minHeight: `${height}px` }}
        />

        {/* 上传进度条 */}
        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 bg-blue-50 border-t border-blue-200 p-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>
                    {t("components.editor.uploading", "업로드 중...")}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* 表格右键菜单 */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t("components.editor.tableActions", "표 편집")}
          </div>
          <button type="button" onClick={() => runTableAction('addRowBefore')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <span className="w-4 text-center text-xs">↑</span>{t("components.editor.addRowBefore", "위에 행 추가")}
          </button>
          <button type="button" onClick={() => runTableAction('addRowAfter')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <span className="w-4 text-center text-xs">↓</span>{t("components.editor.addRowAfter", "아래에 행 추가")}
          </button>
          <button type="button" onClick={() => runTableAction('addColumnBefore')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <span className="w-4 text-center text-xs">←</span>{t("components.editor.addColBefore", "왼쪽에 열 추가")}
          </button>
          <button type="button" onClick={() => runTableAction('addColumnAfter')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <span className="w-4 text-center text-xs">→</span>{t("components.editor.addColAfter", "오른쪽에 열 추가")}
          </button>
          <div className="border-t border-gray-200 my-1" />
          <button type="button" onClick={() => runTableAction('deleteRow')} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
            <span className="w-4 text-center text-xs">✕</span>{t("components.editor.deleteRow", "행 삭제")}
          </button>
          <button type="button" onClick={() => runTableAction('deleteColumn')} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
            <span className="w-4 text-center text-xs">✕</span>{t("components.editor.deleteCol", "열 삭제")}
          </button>
          <div className="border-t border-gray-200 my-1" />
          <button type="button" onClick={() => runTableAction('deleteTable')} className="w-full text-left px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 flex items-center gap-2">
            <span className="w-4 text-center text-xs">🗑</span>{t("components.editor.deleteTable", "표 삭제")}
          </button>
        </div>
      )}

      {/* 链接输入 Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setLinkUrl("");
          setLinkText("");
          setLinkMode("edit");
        }}
        title={t("components.editor.addLink", "링크 추가")}
      >
        <div className="space-y-4">
          {linkMode === "insert" && (
            <Input
              label={t("components.editor.linkText", "링크 텍스트")}
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
            />
          )}

          <Input
            label={t("components.editor.linkUrl", "링크 주소")}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowLinkModal(false);
                setLinkUrl("");
                setLinkText("");
                setLinkMode("edit");
              }}
            >
              {t("common.cancel", "취소")}
            </Button>
            <Button onClick={handleConfirmLink}>
              {t("common.confirm", "확인")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 表格行列设置 Modal */}
      <Modal
        isOpen={showTableModal}
        onClose={() => {
          setShowTableModal(false);
          setTableRows(3);
          setTableCols(3);
        }}
        title={t("components.editor.insertTable", "표 삽입")}
      >
        <div className="space-y-4">
          <Input
            label={t("components.editor.tableRows", "행 수")}
            type="number"
            min={1}
            max={20}
            value={tableRows}
            onChange={(e) => setTableRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
          />
          <Input
            label={t("components.editor.tableCols", "열 수")}
            type="number"
            min={1}
            max={10}
            value={tableCols}
            onChange={(e) => setTableCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTableModal(false);
                setTableRows(3);
                setTableCols(3);
              }}
            >
              {t("common.cancel", "취소")}
            </Button>
            <Button
              onClick={() => {
                editor?.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run();
                setShowTableModal(false);
                setTableRows(3);
                setTableCols(3);
              }}
            >
              {t("common.confirm", "확인")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TiptapEditor;
