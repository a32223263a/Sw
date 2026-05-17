import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Type,
  Hash,
  Calendar,
  ChevronDown,
  Table as TableIcon,
  AlignLeft,
  GripVertical,
  Trash2,
  Plus,
  Save,
  Eye,
  Code2,
  ShieldAlert,
  Users,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  Layers,
  Braces,
  PanelLeft,
  PanelRight,
  Settings,
  Info,
  ToggleLeft,
  ToggleRight,
  FileText,
  Database,
  ArrowRight,
  Zap,
} from "lucide-react";

/* ─────────────────────────────────────────────────
   타입
───────────────────────────────────────────────── */
type FieldType = "text" | "number" | "date" | "select" | "longtext" | "table";

type FormField = {
  id: string;
  type: FieldType;
  label: string;
  key: string;          // JSON 매핑 키
  required: boolean;
  placeholder?: string;
  options?: string[];   // select 전용
  rows?: number;        // table 전용
  cols?: string[];      // table 전용 (열 헤더)
};

const FIELD_PRESETS: { type: FieldType; label: string; icon: React.ReactNode; defaultKey: string }[] = [
  { type: "text",     label: "텍스트 입력",   icon: <Type size={14} />,      defaultKey: "text_field" },
  { type: "number",   label: "숫자(금액)",     icon: <Hash size={14} />,      defaultKey: "amount" },
  { type: "date",     label: "날짜 선택",      icon: <Calendar size={14} />,  defaultKey: "date" },
  { type: "select",   label: "드롭다운",       icon: <ChevronDown size={14} />, defaultKey: "selection" },
  { type: "longtext", label: "여러 줄 입력",   icon: <AlignLeft size={14} />, defaultKey: "description" },
  { type: "table",    label: "표 삽입",        icon: <TableIcon size={14} />, defaultKey: "items" },
];

const FIELD_LABEL: Record<FieldType, string> = {
  text: "텍스트", number: "숫자", date: "날짜", select: "드롭다운", longtext: "장문", table: "표",
};

/* ─────────────────────────────────────────────────
   초기 샘플 (지출결의서 예시)
───────────────────────────────────────────────── */
const INITIAL_FIELDS: FormField[] = [
  { id: "f1", type: "text",   label: "제목",       key: "title",      required: true },
  { id: "f2", type: "date",   label: "집행 예정일", key: "exec_date",  required: true },
  { id: "f3", type: "select", label: "비용 분류",   key: "expense_type", required: true, options: ["출장비", "회의비", "비품 구매", "외주 용역"] },
  { id: "f4", type: "table",  label: "지출 내역",   key: "items",      required: true, rows: 3, cols: ["적요", "수량", "단가", "금액"] },
  { id: "f5", type: "number", label: "합계 금액",   key: "total_amount", required: true, placeholder: "원" },
  { id: "f6", type: "longtext", label: "지출 사유", key: "reason",     required: false, rows: 4 },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/* ─────────────────────────────────────────────────
   필드 렌더러 (캔버스 미리보기)
───────────────────────────────────────────────── */
function FieldPreview({ field }: { field: FormField }) {
  const baseInput = "w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded bg-white";
  if (field.type === "text") {
    return <input type="text" className={baseInput} placeholder={field.placeholder ?? `${field.label}을(를) 입력`} disabled />;
  }
  if (field.type === "number") {
    return (
      <div className="flex items-center gap-2">
        <input type="text" className={`${baseInput} flex-1`} placeholder="0" disabled />
        <span className="text-xs text-gray-500">{field.placeholder ?? "원"}</span>
      </div>
    );
  }
  if (field.type === "date") {
    return <input type="date" className={baseInput} disabled />;
  }
  if (field.type === "longtext") {
    return <textarea className={`${baseInput} resize-none`} rows={field.rows ?? 3} placeholder={field.placeholder ?? "내용을 입력하세요"} disabled />;
  }
  if (field.type === "select") {
    return (
      <select className={baseInput} disabled>
        {(field.options ?? []).map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  }
  if (field.type === "table") {
    const cols = field.cols ?? ["항목", "값"];
    const rows = field.rows ?? 2;
    return (
      <div className="border border-gray-300 rounded overflow-hidden">
        <div className="grid bg-gray-50 border-b border-gray-300" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
          {cols.map((c, i) => (
            <div key={i} className={`px-2.5 py-1.5 text-xs text-gray-600 ${i < cols.length - 1 ? "border-r border-gray-300" : ""}`} style={{ fontWeight: 600 }}>{c}</div>
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className={`grid ${r < rows - 1 ? "border-b border-gray-200" : ""}`} style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
            {cols.map((_, c) => (
              <div key={c} className={`px-2.5 py-1.5 ${c < cols.length - 1 ? "border-r border-gray-200" : ""}`}>
                <div className="h-4 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  return null;
}

/* ─────────────────────────────────────────────────
   메인 페이지
───────────────────────────────────────────────── */
export function FormBuilderPage() {
  const [formTitle, setFormTitle] = useState("지출 결의서 (IT 기획팀)");
  const [fields, setFields] = useState<FormField[]>(INITIAL_FIELDS);
  const [selectedId, setSelectedId] = useState<string | null>("f4");
  const [highRiskAmount, setHighRiskAmount] = useState("1,000,000");
  const [approverLine, setApproverLine] = useState([
    { name: "팀장", title: "1차 결재" },
    { name: "부서장", title: "2차 결재" },
  ]);
  const [showJSON, setShowJSON] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [canvasTab, setCanvasTab] = useState<"html" | "json">("html");

  const selected = useMemo(() => fields.find((f) => f.id === selectedId) ?? null, [fields, selectedId]);

  const addField = (type: FieldType) => {
    const preset = FIELD_PRESETS.find((p) => p.type === type)!;
    const newField: FormField = {
      id: uid(),
      type,
      label: preset.label,
      key: `${preset.defaultKey}_${fields.length + 1}`,
      required: false,
      ...(type === "select" ? { options: ["옵션 1", "옵션 2"] } : {}),
      ...(type === "table" ? { rows: 2, cols: ["항목", "값"] } : {}),
    };
    setFields([...fields, newField]);
    setSelectedId(newField.id);
  };

  const updateField = (id: string, patch: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const move = (id: string, dir: -1 | 1) => {
    const i = fields.findIndex((f) => f.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= fields.length) return;
    const next = [...fields];
    [next[i], next[j]] = [next[j], next[i]];
    setFields(next);
  };

  /* JSON 스키마 미리보기 (ADR-004 시각 증명) */
  const schemaJSON = useMemo(() => {
    return JSON.stringify(
      {
        form_title: formTitle,
        risk_threshold_won: Number(highRiskAmount.replace(/,/g, "")) || 0,
        approver_line: approverLine,
        schema: fields.map((f) => ({
          key: f.key,
          type: f.type,
          label: f.label,
          required: f.required,
          ...(f.options ? { options: f.options } : {}),
          ...(f.cols ? { columns: f.cols, default_rows: f.rows } : {}),
        })),
      },
      null,
      2,
    );
  }, [formTitle, highRiskAmount, approverLine, fields]);

  /* 저장 시뮬레이션 (실패 5% 확률) */
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      const dupKey = fields.map((f) => f.key).find((k, i, arr) => arr.indexOf(k) !== i);
      if (dupKey) {
        setToast({ type: "error", msg: `JSON 키 중복: "${dupKey}". 매핑 키는 서식 내에서 고유해야 합니다.` });
        return;
      }
      if (!formTitle.trim()) {
        setToast({ type: "error", msg: "서식 제목이 비어 있습니다." });
        return;
      }
      setToast({ type: "success", msg: `"${formTitle}" 서식이 저장되었습니다. 기안자 화면에서 즉시 노출됩니다.` });
    }, 900);
  };

  return (
    <div className="flex flex-col bg-gray-50" style={{ height: "calc(100vh - 3.5rem)" }}>
      {/* ── Page Header ── */}
      <div className="px-6 pt-5 pb-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
          <span>부서 관리</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-800" style={{ fontWeight: 600 }}>양식 빌더</span>
          <span className="ml-2 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={10} /> ADR-004 시각 증명
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none px-1 -mx-1 w-full"
              style={{ fontSize: "1.125rem", fontWeight: 700 }}
            />
            <p className="text-xs text-gray-500 mt-1">
              부서 관리자가 사내 고유 서식을 정의합니다 · HTML 레이아웃과 JSON 스키마가 분리 저장됩니다.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCanvasTab((t) => t === "json" ? "html" : "json")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors ${canvasTab === "json" ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"}`}
            >
              <Braces size={13} /> {canvasTab === "json" ? "서식 디자인으로" : "JSON 매핑 보기"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all ${saving ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"}`}
            >
              <Save size={13} /> {saving ? "저장 중..." : "서식 저장"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Three-column workspace ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ─── 좌측: 도구상자 ─── */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <PanelLeft size={13} className="text-gray-500" />
            <span className="text-xs text-gray-700" style={{ fontWeight: 600 }}>입력 도구</span>
          </div>
          <div className="p-3 space-y-1.5 overflow-y-auto">
            {FIELD_PRESETS.map((p) => (
              <button
                key={p.type}
                onClick={() => addField(p.type)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-left transition-colors group"
              >
                <span className="w-7 h-7 rounded bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-600 group-hover:text-blue-600 transition-colors">
                  {p.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-800">{p.label}</p>
                  <p className="text-xs text-gray-400">+ 캔버스에 추가</p>
                </div>
                <Plus size={12} className="text-gray-400 group-hover:text-blue-600" />
              </button>
            ))}
          </div>

          {/* 결재선 템플릿 */}
          <div className="mt-auto border-t border-gray-200 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-600" style={{ fontWeight: 600 }}>
              <Users size={12} /> 결재선 템플릿
            </div>
            {approverLine.map((a, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                <input
                  value={a.name}
                  onChange={(e) => {
                    const next = [...approverLine];
                    next[i] = { ...next[i], name: e.target.value };
                    setApproverLine(next);
                  }}
                  className="text-xs text-gray-700 bg-transparent flex-1 min-w-0 focus:outline-none"
                />
                <button onClick={() => setApproverLine(approverLine.filter((_, x) => x !== i))} className="text-gray-300 hover:text-red-500">
                  <X size={11} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setApproverLine([...approverLine, { name: "결재자", title: `${approverLine.length + 1}차 결재` }])}
              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-blue-600 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Plus size={11} /> 결재자 추가
            </button>
          </div>
        </aside>

        {/* ─── 중앙: 캔버스 ─── */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* ── 탭 헤더 (sticky) ── */}
          <div className="shrink-0 bg-white border-b border-gray-200 px-6 flex items-center gap-0">
            <button
              onClick={() => setCanvasTab("html")}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs border-b-2 transition-colors ${canvasTab === "html" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              style={{ fontWeight: canvasTab === "html" ? 600 : 400 }}
            >
              <FileText size={12} /> 서식 디자인 (HTML)
            </button>
            <button
              onClick={() => setCanvasTab("json")}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs border-b-2 transition-colors ${canvasTab === "json" ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              style={{ fontWeight: canvasTab === "json" ? 600 : 400 }}
            >
              <Braces size={12} /> 데이터 매핑 (JSON)
            </button>

            {/* ADR-004 Badge */}
            <div className="ml-auto flex items-center gap-1.5 text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full">
              <Zap size={11} className="text-indigo-600" />
              <span style={{ fontWeight: 600 }}>ADR-004: HTML/JSON 분리 저장 아키텍처</span>
            </div>
          </div>

          {/* ── 탭 콘텐츠 ── */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {canvasTab === "html" ? (
                <motion.div
                  key="html"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="p-6"
                >
                  {/* ── Tab 1: 서식 디자인 WYSIWYG 캔버스 ── */}
                  <div className="max-w-3xl mx-auto">
                    <div className="bg-white border border-gray-300 rounded shadow-sm">
                      {/* 문서 헤더 (회사 서식) */}
                      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-300 bg-white gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded bg-blue-700 flex items-center justify-center shrink-0">
                            <span className="text-white text-xs" style={{ fontWeight: 700 }}>CORP</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">전자결재 · 사내 고유 서식 (HTML)</p>
                            <h3 className="text-gray-900" style={{ fontWeight: 700 }}>{formTitle || "(제목 없음)"}</h3>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <p className="text-xs text-gray-400 mb-1">결재</p>
                          <div className="flex border border-gray-400">
                            {["기안자", ...approverLine.map((a) => a.title)].map((label) => (
                              <div key={label} className="border-r border-gray-400 last:border-r-0 px-3 py-1 bg-gray-50 text-center" style={{ minWidth: 56 }}>
                                <p className="text-xs text-gray-600" style={{ fontWeight: 600 }}>{label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 캔버스 빈 상태 */}
                      {fields.length === 0 ? (
                        <div className="px-6 py-16 text-center text-gray-400">
                          <Layers size={32} className="mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">좌측 도구상자에서 입력 필드를 추가해 양식을 구성하세요.</p>
                        </div>
                      ) : (
                        <div className="p-6 space-y-3">
                          {fields.map((f) => {
                            const isSel = f.id === selectedId;
                            return (
                              <motion.div
                                key={f.id}
                                layout
                                onClick={() => setSelectedId(f.id)}
                                className={`relative group rounded-lg border transition-colors cursor-pointer ${isSel ? "border-blue-400 ring-2 ring-blue-100 bg-blue-50/30" : "border-transparent hover:border-gray-300"} p-3`}
                              >
                                <div className={`absolute -left-9 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 transition-opacity ${isSel ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                  <button onClick={(e) => { e.stopPropagation(); move(f.id, -1); }} className="w-6 h-5 text-gray-400 hover:text-gray-700 text-xs">▲</button>
                                  <GripVertical size={12} className="text-gray-300" />
                                  <button onClick={(e) => { e.stopPropagation(); move(f.id, 1); }} className="w-6 h-5 text-gray-400 hover:text-gray-700 text-xs">▼</button>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{f.label}</span>
                                      {f.required && <span className="text-xs text-red-500">*</span>}
                                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{FIELD_LABEL[f.type]}</span>
                                    </div>
                                    <FieldPreview field={f} />
                                  </div>
                                  {isSel && (
                                    <button onClick={(e) => { e.stopPropagation(); removeField(f.id); }} className="shrink-0 w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="json"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.18 }}
                  className="p-6"
                >
                  {/* ── Tab 2: 데이터 매핑 JSON 바인딩 뷰 ── */}
                  <div className="max-w-3xl mx-auto space-y-4">

                    {/* ADR-004 설명 배너 */}
                    <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Database size={13} className="text-white" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm text-indigo-900" style={{ fontWeight: 600 }}>ADR-004: HTML 서식 ↔ JSON 데이터 분리 아키텍처</p>
                        <p className="text-xs text-indigo-700 leading-relaxed">
                          기안자가 데이터를 입력하면 <strong>시각적 서식(HTML)</strong>은 그대로 유지되고, <strong>입력 데이터</strong>만 아래 키 구조로 DB의 JSONB 컬럼에 분리 저장됩니다.
                        </p>
                      </div>
                    </div>

                    {/* 아키텍처 흐름도 */}
                    <div className="flex items-center justify-center gap-3 py-2">
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
                        <FileText size={14} className="text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-800" style={{ fontWeight: 600 }}>HTML 서식</p>
                          <p className="text-xs text-blue-600">forms_html 컬럼</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <ArrowRight size={16} className="text-gray-400" />
                        <span className="text-xs text-gray-400">분리 저장</span>
                      </div>
                      <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5">
                        <Database size={14} className="text-indigo-600" />
                        <div>
                          <p className="text-xs text-indigo-800" style={{ fontWeight: 600 }}>JSON 스키마</p>
                          <p className="text-xs text-indigo-600">forms_json JSONB 컬럼</p>
                        </div>
                      </div>
                    </div>

                    {/* 필드별 JSON 키 바인딩 테이블 */}
                    <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
                      {/* 문서 헤더 (HTML 레이아웃 스냅샷) */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-300 bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-700 flex items-center justify-center shrink-0">
                            <span className="text-white text-xs" style={{ fontWeight: 700 }}>CORP</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">HTML 서식 레이아웃</p>
                            <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>{formTitle}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                          HTML 고정 영역 (read-only)
                        </span>
                      </div>

                      {/* 필드 매핑 행 */}
                      {fields.length === 0 ? (
                        <div className="py-10 text-center text-gray-400">
                          <p className="text-sm">HTML 탭에서 필드를 추가하면 JSON 매핑이 여기에 표시됩니다.</p>
                        </div>
                      ) : (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left px-4 py-2 text-xs text-gray-500 w-8" style={{ fontWeight: 600 }}>#</th>
                              <th className="text-left px-4 py-2 text-xs text-gray-500 w-28" style={{ fontWeight: 600 }}>표시 라벨 (HTML)</th>
                              <th className="text-left px-4 py-2 text-xs text-gray-500" style={{ fontWeight: 600 }}>
                                <span className="flex items-center gap-1"><ArrowRight size={11} /> JSON 매핑 키 (DB 저장)</span>
                              </th>
                              <th className="text-left px-4 py-2 text-xs text-gray-500 w-20" style={{ fontWeight: 600 }}>타입</th>
                              <th className="text-left px-4 py-2 text-xs text-gray-500 w-14" style={{ fontWeight: 600 }}>필수</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map((f, idx) => (
                              <tr
                                key={f.id}
                                onClick={() => { setSelectedId(f.id); setCanvasTab("html"); }}
                                className="border-b border-gray-100 last:border-0 hover:bg-indigo-50/30 cursor-pointer transition-colors"
                              >
                                <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{f.label}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <code className="text-xs font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                                      form_data.{f.key}
                                    </code>
                                    {f.type === "number" && (
                                      <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                        💡 리스크 집계 대상
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{FIELD_LABEL[f.type]}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {f.required
                                    ? <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">필수</span>
                                    : <span className="text-xs text-gray-400">-</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* JSON 스키마 미리보기 (ADR-004 어필 — Tab 2에서 항상 노출) */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <Code2 size={12} />
                          <span style={{ fontWeight: 600 }}>form_schema.json</span>
                          <span className="text-gray-500">— DB의 JSONB 컬럼에 분리 적재 (ADR-004)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">JSONB</span>
                          <span className="text-xs bg-indigo-900/40 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">ADR-004</span>
                        </div>
                      </div>
                      <pre className="px-4 py-3 text-xs text-emerald-300 font-mono overflow-x-auto max-h-72 leading-relaxed">{schemaJSON}</pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* ─── 우측: 속성/매핑 패널 ─── */}
        <aside className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <PanelRight size={13} className="text-gray-500" />
            <span className="text-xs text-gray-700" style={{ fontWeight: 600 }}>
              {selected ? "필드 속성" : "양식 설정"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selected ? (
              <>
                {/* ─── 사용자 노출 속성 (UX 추상화) ─── */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">기본 설정</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-700">표시 이름 (Label)</label>
                  <input
                    value={selected.label}
                    onChange={(e) => updateField(selected.id, { label: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="사용자에게 보여질 이름"
                  />
                </div>

                {(selected.type === "text" || selected.type === "number" || selected.type === "longtext") && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-700">플레이스홀더</label>
                    <input
                      value={selected.placeholder ?? ""}
                      onChange={(e) => updateField(selected.id, { placeholder: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                      placeholder="입력 안내 텍스트"
                    />
                  </div>
                )}

                <button
                  onClick={() => updateField(selected.id, { required: !selected.required })}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${selected.required ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  <div className="flex items-center gap-2">
                    {selected.required ? <ToggleRight size={16} className="text-blue-600" /> : <ToggleLeft size={16} className="text-gray-400" />}
                    <span className="text-xs">필수 입력</span>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${selected.required ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"}`}>
                    {selected.required ? "필수" : "선택"}
                  </span>
                </button>

                {selected.type === "select" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-700">선택 옵션 (줄바꿈 구분)</label>
                    <textarea
                      value={(selected.options ?? []).join("\n")}
                      onChange={(e) => updateField(selected.id, { options: e.target.value.split("\n").filter(Boolean) })}
                      rows={4}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:border-blue-400"
                    />
                  </div>
                )}

                {selected.type === "table" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-700">열 헤더 (쉼표 구분)</label>
                      <input
                        value={(selected.cols ?? []).join(", ")}
                        onChange={(e) => updateField(selected.id, { cols: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-700">기본 행 수</label>
                      <input
                        type="number"
                        min={1}
                        value={selected.rows ?? 2}
                        onChange={(e) => updateField(selected.id, { rows: Math.max(1, Number(e.target.value)) })}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </>
                )}

                {/* ─── 고급 설정 아코디언 (개발자용 JSON 매핑 키) ─── */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setAdvancedOpen((v) => !v)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${advancedOpen ? "bg-gray-100" : "bg-gray-50 hover:bg-gray-100"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings size={12} className="text-gray-500" />
                      <span className="text-xs text-gray-600">고급 설정 (개발자용)</span>
                    </div>
                    <ChevronDown size={12} className={`text-gray-400 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {advancedOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 py-3 space-y-3 bg-white border-t border-gray-200">
                          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded px-2.5 py-2">
                            <Info size={11} className="text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700 leading-relaxed">
                              라벨을 기준으로 자동 생성되었습니다. 변경 시 기존 데이터와 불일치가 발생할 수 있습니다.
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs text-gray-600">JSON 매핑 키</label>
                              <span className="text-xs text-indigo-600 font-mono">form_data.{selected.key}</span>
                            </div>
                            <input
                              value={selected.key}
                              onChange={(e) => updateField(selected.id, { key: e.target.value.replace(/[^a-z0-9_]/g, "_") })}
                              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded font-mono focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                              placeholder="snake_case_only"
                            />
                            <p className="text-xs text-gray-400">기안자의 입력값은 이 키로 DB(JSONB)에 저장됩니다.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <button
                    onClick={() => removeField(selected.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={12} /> 이 필드 삭제
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Eye size={24} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs">캔버스에서 필드를 선택하면 속성을 설정할 수 있습니다.</p>
              </div>
            )}
          </div>

          {/* 하단 통제 영역: 위험도 / 결재선 */}
          <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
            <div className="flex items-center gap-1.5 text-xs text-gray-600" style={{ fontWeight: 600 }}>
              <ShieldAlert size={12} className="text-red-500" /> 위험도 기준
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500">고위험 자동 분류 금액 (원)</label>
              <div className="flex items-center gap-1.5">
                <input
                  value={highRiskAmount}
                  onChange={(e) => setHighRiskAmount(e.target.value.replace(/[^\d,]/g, ""))}
                  className="flex-1 min-w-0 px-2.5 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-red-400"
                />
                <span className="text-xs text-gray-500 shrink-0">원 이상</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                이 금액을 넘는 기안은 자동으로 HIGH로 분류되어 2FA·전체 열람 조건이 적용됩니다.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ opacity: 0, y: 16, x: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onAnimationComplete={() => setTimeout(() => setToast(null), 3200)}
          >
            <div className={`flex items-start gap-2.5 max-w-sm px-4 py-3 rounded-xl shadow-2xl border ${toast.type === "success" ? "bg-emerald-600 border-emerald-700 text-white" : "bg-red-600 border-red-700 text-white"}`}>
              {toast.type === "success" ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" /> : <AlertTriangle size={15} className="shrink-0 mt-0.5" />}
              <div className="flex-1 text-xs leading-relaxed">{toast.msg}</div>
              <button onClick={() => setToast(null)} className="text-white/70 hover:text-white shrink-0">
                <X size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
