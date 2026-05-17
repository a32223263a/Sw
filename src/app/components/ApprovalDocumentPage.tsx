import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Paperclip,
  CheckCircle2,
  ChevronRight,
  User,
  X,
  AlertCircle,
  Lock,
  Info,
  Clock,
  Check,
  Building2,
  Calendar,
  Shield,
  RefreshCw,
  FileText,
  Hash,
  Send,
  AlertTriangle,
} from "lucide-react";
import {
  RichEditorPanel,
  isDocumentDataFilled,
  buildContentSnapshot,
  type FormType,
  type DocumentData,
} from "./RichEditorPanel";

/* ─────────────────────────────────────────────────
   상수
───────────────────────────────────────────────── */
const FORM_TYPES: FormType[] = [
  "장비 구매 요청서",
  "출장 신청서",
  "휴가 신청서",
  "지출 결의서",
  "업무 협조 요청서",
];

type Approver = {
  id: number;
  name: string;
  title: string;
  dept: string;
  order: number;
  initials: string;
};

const DEFAULT_APPROVERS: Approver[] = [
  { id: 1, name: "김기훈", title: "팀장", dept: "IT 기획팀", order: 1, initials: "기" },
  { id: 2, name: "이수연", title: "부장", dept: "전략기획본부", order: 2, initials: "수" },
];

type FileItem = { id: number; name: string; size: string; isPdf?: boolean };
type OcrStatus = "processing" | "done";

/* ─────────────────────────────────────────────────
   상신 확인 모달 (방어적 설계 — 재확인 패턴)
───────────────────────────────────────────────── */
function SubmitConfirmModal({
  formType,
  approvers,
  onConfirm,
  onClose,
}: {
  formType: string;
  approvers: { name: string; title: string }[];
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-[480px] overflow-hidden border border-gray-200"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
              <Send size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-800">결재 상신 확인</h3>
              <p className="text-xs text-blue-600 mt-0.5">상신 전 아래 내용을 확인해 주세요.</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* 양식 및 결재선 확인 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">양식</span>
              <span className="text-gray-800" style={{ fontWeight: 600 }}>{formType}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">결재선</span>
              <div className="flex items-center gap-1.5">
                {approvers.map((a, i) => (
                  <span key={i} className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    {a.name} {a.title}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 핵심 안내 — 방어적 설계 */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3.5">
            <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm text-amber-900" style={{ fontWeight: 600 }}>상신 후 유의사항</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                결재 상신 후에는 <strong>다음 결재자가 열람하기 전까지만</strong> 수정 및 회수가 가능합니다. 결재자가 문서를 열람한 이후에는 내용 변경이 불가능합니다.
              </p>
            </div>
          </div>

          {/* 상신 결과 안내 */}
          <div className="space-y-1.5">
            {[
              "상신 즉시 1차 결재자에게 알림이 발송됩니다.",
              "문서 상태가 '결재 진행 중'으로 변경됩니다.",
              "내 기안함 → 진행중 탭에서 결재 현황을 확인할 수 있습니다.",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            돌아가기
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Send size={13} /> 안전하게 상신하기
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   통합 스트림 스켈레톤 UI
───────────────────────────────────────────────── */
function Sk({ w = "w-full", h = "h-4", cls = "" }: { w?: string; h?: string; cls?: string }) {
  return <div className={`${w} ${h} bg-gray-200 rounded ${cls}`} />;
}

function ShimmerOverlay({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute inset-y-0 left-0 pointer-events-none z-10"
      style={{
        width: "100%",
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.72) 50%, transparent 100%)",
      }}
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay }}
    />
  );
}

function UnifiedStreamSkeleton({ onReplay }: { onReplay?: () => void }) {
  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Sk w="w-20" h="h-3" />
        <Sk w="w-2" h="h-3" />
        <Sk w="w-16" h="h-3" />
        <Sk w="w-2" h="h-3" />
        <Sk w="w-28" h="h-3" />
      </div>

      <div className="flex gap-5">
        {/* ── 메인 카드 스켈레톤 ── */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden relative">
          <ShimmerOverlay delay={0} />

          {/* 카드 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <Sk w="w-36" h="h-5" />
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* 양식 선택 */}
            <div className="space-y-1.5">
              <Sk w="w-16" h="h-3" />
              <Sk w="w-full" h="h-10" cls="rounded-md" />
            </div>

            {/* 결재선 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Sk w="w-12" h="h-3" />
                <Sk w="w-24" h="h-5" cls="rounded-full" />
              </div>
              <Sk w="w-full" h="h-8" cls="rounded-md" />
              <div className="flex items-center gap-2 pt-1">
                <Sk w="w-36" h="h-12" cls="rounded-md" />
                <Sk w="w-3" h="h-3" />
                <Sk w="w-36" h="h-12" cls="rounded-md" />
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* 제목 */}
            <div className="space-y-1.5">
              <Sk w="w-8" h="h-3" />
              <Sk w="w-full" h="h-10" cls="rounded-md" />
            </div>

            {/* 에디터 영역 */}
            <div className="space-y-1.5">
              <Sk w="w-20" h="h-3" />
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* 에디터 헤더 바 */}
                <div className="h-8 bg-blue-200" />
                {/* 툴바 */}
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex gap-1.5 flex-wrap">
                  <Sk w="w-20" h="h-6" />
                  <Sk w="w-14" h="h-6" />
                  {[...Array(10)].map((_, i) => (
                    <Sk key={i} w="w-7" h="h-6" />
                  ))}
                </div>
                {/* 문서 본문 */}
                <div className="p-5 space-y-4 bg-[#fafafa]">
                  {/* 문서 헤더 블록 */}
                  <div className="border border-gray-300 rounded-sm overflow-hidden">
                    <div className="flex items-start justify-between px-6 py-4 border-b border-gray-300 bg-white gap-4">
                      <div className="flex items-center gap-4">
                        <Sk w="w-12" h="h-12" cls="rounded shrink-0" />
                        <div className="space-y-2">
                          <Sk w="w-24" h="h-2.5" />
                          <Sk w="w-36" h="h-4" />
                        </div>
                      </div>
                      <div className="space-y-1.5 items-end flex flex-col">
                        <Sk w="w-12" h="h-2.5" />
                        <div className="flex border border-gray-300">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="border-r border-gray-300 last:border-r-0">
                              <Sk w="w-16" h="h-6" cls="rounded-none" />
                              <Sk w="w-16" h="h-10" cls="rounded-none bg-gray-100" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 border-b border-gray-300">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`flex ${i < 3 ? "border-r border-gray-300" : ""}`}>
                          <Sk w="w-16" h="h-8" cls="rounded-none bg-gray-100 shrink-0" />
                          <div className="flex-1 h-8 bg-white" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 본문 블록 */}
                  <div className="bg-white border border-gray-200 rounded-sm px-5 py-4 space-y-4">
                    {/* 섹션 헤더 */}
                    <Sk w="w-full" h="h-7" cls="rounded-sm bg-gray-100" />
                    {/* 표 헤더 */}
                    <Sk w="w-full" h="h-8" cls="rounded-sm bg-gray-100" />
                    {/* 표 행 */}
                    {[...Array(5)].map((_, i) => (
                      <Sk key={i} w="w-full" h="h-9" cls="rounded-none bg-gray-50" />
                    ))}
                    {/* 합계 행 */}
                    <Sk w="w-full" h="h-8" cls="rounded-sm bg-blue-100" />

                    {/* 예산 현황 */}
                    <Sk w="w-full" h="h-7" cls="rounded-sm bg-gray-100 mt-2" />
                    <div className="grid grid-cols-4 gap-2">
                      {[...Array(4)].map((_, i) => (
                        <Sk key={i} w="w-full" h="h-14" cls="rounded" />
                      ))}
                    </div>
                    <Sk w="w-full" h="h-3" cls="rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <Sk w="w-20" h="h-9" cls="rounded-md" />
            <Sk w="w-24" h="h-9" cls="rounded-md bg-blue-200" />
          </div>
        </div>

        {/* ── 우측 패널 스켈레톤 ── */}
        <div className="w-60 space-y-4 shrink-0">
          {/* 문서 기본 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 relative overflow-hidden">
            <ShimmerOverlay delay={0.15} />
            <Sk w="w-28" h="h-4" cls="mb-4" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Sk w="w-16" h="h-3" />
                  <Sk w="w-20" h="h-3" />
                </div>
              ))}
            </div>
          </div>

          {/* 결재 진행 현황 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 relative overflow-hidden">
            <ShimmerOverlay delay={0.25} />
            <Sk w="w-28" h="h-4" cls="mb-4" />
            <div className="space-y-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Sk w="w-9" h="h-9" cls="rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Sk w="w-16" h="h-3" />
                    <Sk w="w-24" h="h-2.5" />
                  </div>
                  <Sk w="w-14" h="h-5" cls="rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 로딩 상태 표시 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-gray-900 text-white text-xs px-4 py-2.5 rounded-full shadow-lg z-50">
        <motion.div
          className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
        <span>결재 문서 데이터를 불러오는 중입니다...</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────── */
export function ApprovalDocumentPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  const [selectedForm, setSelectedForm] = useState<FormType>("지출 결의서");
  const [isFormDropdownOpen, setIsFormDropdownOpen] = useState(false);
  const [title, setTitle] = useState("2026년 2분기 IT 기획팀 운영 경비 지출결의서");
  const [approvers] = useState<Approver[]>(DEFAULT_APPROVERS);
  const [files, setFiles] = useState<FileItem[]>([
    { id: 1, name: "영수증_2분기_IT비용.pdf", size: "1.4 MB", isPdf: true },
  ]);
  const [showConstraintTooltip, setShowConstraintTooltip] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<Record<number, OcrStatus>>({ 1: "processing" });

  useEffect(() => {
    const t = setTimeout(() => setOcrStatus((prev) => ({ ...prev, 1: "done" })), 4000);
    return () => clearTimeout(t);
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documentData, setDocumentData] = useState<DocumentData>({
    purpose:
      "2분기 IT 기획팀 운영 경비 집행 승인을 요청드립니다. 클라우드 전환 프로젝트 지원 세미나 참가비, 협업 툴 구독료, 분기 전략 회의 식대, 부산 지사 출장비, 사무용 소모품 구입비로 구성된 4~5월 실적 경비이며, 첨부 영수증과 함께 결재 요청합니다.",
    period: "2026-04-22 ~ 2026-05-05",
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleFieldChange = (key: string, val: string) => {
    setDocumentData((prev) => ({ ...prev, [key]: val }));
  };

  const isTitleFilled = title.trim().length > 0;
  const hasApprovers = approvers.length > 0;
  const isBodyFilled = isDocumentDataFilled(selectedForm, documentData);
  const isSubmitEnabled = isTitleFilled && isBodyFilled && hasApprovers;

  const missingFields: string[] = [];
  if (!hasApprovers) missingFields.push("결재자");
  if (!isTitleFilled) missingFields.push("제목");
  if (!isBodyFilled) missingFields.push("서식 필수 항목");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    const newFiles: FileItem[] = Array.from(fileList).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      isPdf: f.name.toLowerCase().endsWith(".pdf"),
      size:
        f.size < 1024 * 1024
          ? `${(f.size / 1024).toFixed(1)} KB`
          : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    // PDF 파일에 대해 OCR 시뮬레이션
    newFiles.forEach((f) => {
      if (f.isPdf) {
        setOcrStatus((prev) => ({ ...prev, [f.id]: "processing" }));
        setTimeout(() => {
          setOcrStatus((prev) => ({ ...prev, [f.id]: "done" }));
        }, 3500 + Math.random() * 1500);
      }
    });
    e.target.value = "";
  };

  const removeFile = (id: number) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const handleSubmit = () => {
    if (!isSubmitEnabled) return;
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    buildContentSnapshot(selectedForm, documentData);
    setShowSubmitModal(false);
    navigate("/drafts/1");
  };

  /* ── 결재 진행 현황 ── */
  const approvalTimeline = [
    { name: "박도윤", title: "사원", dept: "IT 기획팀", role: "기안자", initials: "도", status: "done" as const },
    { name: "김기훈", title: "팀장", dept: "IT 기획팀", role: "1차 결재", initials: "기", status: "pending" as const },
    { name: "이수연", title: "부장", dept: "전략기획본부", role: "2차 결재", initials: "수", status: "waiting" as const },
  ];

  return (
    <>
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeIn" }}
        >
          <UnifiedStreamSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="p-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
              <span className="hover:text-blue-600 cursor-pointer transition-colors">전자결재 홈</span>
              <ChevronRight size={13} />
              <span className="text-gray-800" style={{ fontWeight: 600 }}>결재 작성</span>
              <ChevronRight size={13} />
              <span className="text-blue-600">{selectedForm}</span>

              {/* 로딩 재현 버튼 */}
              <button
                onClick={() => setIsLoading(true)}
                className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 transition-colors border border-dashed border-gray-300 hover:border-blue-300 px-2.5 py-1 rounded-full"
              >
                <RefreshCw size={11} />
                로딩 애니메이션 재현
              </button>
            </div>

            <div className="flex gap-5">
              {/* ─── Form Card ─── */}
              <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden min-w-0">
                {/* Card Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-gray-800">결재 문서 작성</h2>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {/* ① 양식 선택 */}
                  <div className="space-y-1.5">
                    <label className="text-sm text-gray-700">
                      양식 선택 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setIsFormDropdownOpen((p) => !p)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-md hover:border-blue-400 transition-colors"
                      >
                        <span className="text-gray-800">{selectedForm}</span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isFormDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isFormDropdownOpen && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                          {FORM_TYPES.map((form) => (
                            <button
                              key={form}
                              onClick={() => {
                                setSelectedForm(form);
                                setIsFormDropdownOpen(false);
                                setDocumentData({});
                              }}
                              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${selectedForm === form ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
                            >
                              {form}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ② 결재선 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">
                        결재선 <span className="text-red-500">*</span>
                      </label>
                      <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={11} /> 자동 매핑 완료
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                      <Info size={12} />
                      <span>직책 기반 결재선 템플릿이 자동 적용되었습니다. (1차: 팀장 → 2차: 부서 책임자)</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                      <span className="text-xs text-gray-500">템플릿:</span>
                      {[{ label: "1차: 팀장" }, { label: "2차: 부서 책임자" }].map((chip) => (
                        <span key={chip.label} className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                          {chip.label}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {approvers.map((approver, idx) => (
                        <div key={approver.id} className="flex items-center gap-2">
                          {idx > 0 && <ChevronRight size={14} className="text-gray-400" />}
                          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <User size={11} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{approver.name}</p>
                              <p className="text-xs text-gray-500">{approver.title} · {approver.dept}</p>
                            </div>
                            <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{approver.order}차</span>
                          </div>
                        </div>
                      ))}
                      <button className="flex items-center gap-1 text-xs text-blue-600 border border-dashed border-blue-300 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors">
                        + 결재자 추가
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* ③ 제목 */}
                  <div className="space-y-1.5">
                    <label className="text-sm text-gray-700">
                      제목 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="문서 제목을 입력하세요"
                        maxLength={100}
                        className={`w-full px-3 py-2.5 text-sm border rounded-md focus:outline-none transition-colors ${title.length > 0 ? "border-blue-400 bg-white" : "border-gray-300 bg-white focus:border-blue-400"}`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{title.length}/100</span>
                    </div>
                  </div>

                  {/* ④ 문서 본문 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">
                        문서 내용 <span className="text-red-500">*</span>
                      </label>
                      {isBodyFilled && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={11} /> 서식 입력 완료
                        </span>
                      )}
                    </div>
                    <RichEditorPanel
                      formType={selectedForm}
                      documentData={documentData}
                      onChange={handleFieldChange}
                      approvers={approvers.map((a) => ({ name: a.name, title: a.title, order: a.order }))}
                      writer="박도윤"
                      dept="IT 기획팀"
                      date="2026-05-05"
                      docNo="자동 부여"
                    />
                  </div>

                  {/* ⑤ 첨부파일 */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">첨부파일</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-gray-300 rounded-md px-4 py-3 flex items-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    >
                      <Paperclip size={15} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors">첨부파일 등록 (최대 10MB · 이미지/PDF는 OCR 처리 자동 등록)</span>
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
                    </div>
                    {files.length > 0 && (
                      <div className="space-y-1.5">
                        {files.map((file) => {
                          const ocr = ocrStatus[file.id];
                          return (
                            <div key={file.id} className={`flex items-center justify-between px-3 py-2.5 border rounded-md transition-colors ${ocr === "processing" ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200"}`}>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Paperclip size={13} className={ocr === "processing" ? "text-purple-500" : "text-gray-400"} />
                                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                <span className="text-xs text-gray-400 shrink-0">({file.size})</span>
                                {/* OCR 상태 배지 */}
                                {ocr === "processing" && (
                                  <span className="flex items-center gap-1.5 text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full shrink-0 ml-1">
                                    <motion.div
                                      className="w-2.5 h-2.5 border-2 border-purple-500 border-t-transparent rounded-full shrink-0"
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                                    />
                                    비동기 OCR 텍스트 추출 중...
                                  </span>
                                )}
                                {ocr === "done" && (
                                  <span className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0 ml-1">
                                    <CheckCircle2 size={10} /> OCR 완료 · 텍스트 추출됨
                                  </span>
                                )}
                              </div>
                              <button onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0">
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <button className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                    임시저장
                  </button>
                  <div
                    className="relative"
                    onMouseEnter={() => !isSubmitEnabled && setShowConstraintTooltip(true)}
                    onMouseLeave={() => setShowConstraintTooltip(false)}
                  >
                    <button
                      onClick={handleSubmit}
                      disabled={!isSubmitEnabled}
                      className={`flex items-center gap-2 px-6 py-2 text-sm rounded-md transition-all ${isSubmitEnabled ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                    >
                      {!isSubmitEnabled && <Lock size={13} />}
                      상신하기
                    </button>
                    {showConstraintTooltip && !isSubmitEnabled && (
                      <div className="absolute bottom-full right-0 mb-2 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-30">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" />
                          <p className="text-gray-100">다음 필수 항목을 완성해야 상신이 가능합니다:</p>
                        </div>
                        <ul className="space-y-1 pl-4">
                          {missingFields.map((f) => (
                            <li key={f} className="text-amber-300 text-xs list-disc">{f}</li>
                          ))}
                        </ul>
                        <div className="absolute bottom-[-5px] right-6 w-2.5 h-2.5 bg-gray-900 rotate-45" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── 우측 패널 ─── */}
              <div className="w-60 space-y-4 shrink-0">
                {/* 문서 기본 정보 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={14} className="text-blue-500" />
                    <h4 className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>문서 기본 정보</h4>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: <Hash size={11} />, label: "기안 번호", value: "상신 시 자동 부여" },
                      { icon: <Building2 size={11} />, label: "기안 부서", value: "IT 기획팀" },
                      { icon: <User size={11} />, label: "기안자", value: "박도윤 (사원)" },
                      { icon: <Calendar size={11} />, label: "기안 일자", value: "2026-05-05" },
                      { icon: <Shield size={11} />, label: "보존 기한", value: "5년" },
                      { icon: <FileText size={11} />, label: "비밀 등급", value: "일반" },
                    ].map((info) => (
                      <div key={info.label} className="flex items-center justify-between gap-2 py-1 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
                          {info.icon}
                          <p className="text-xs text-gray-400">{info.label}</p>
                        </div>
                        <p className="text-xs text-gray-700 text-right truncate">{info.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 결재 진행 현황 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={14} className="text-blue-500" />
                    <h4 className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>결재 진행 현황</h4>
                  </div>
                  <div className="relative">
                    {/* 세로 연결선 */}
                    <div className="absolute left-[17px] top-9 bottom-9 w-px bg-gray-200 z-0" />

                    <div className="space-y-4 relative z-10">
                      {approvalTimeline.map((person, idx) => {
                        const isDone = person.status === "done";
                        const isPending = person.status === "pending";

                        return (
                          <div key={idx} className="flex items-start gap-3">
                            {/* 아바타 */}
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs border-2 ${
                                isDone
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : isPending
                                  ? "bg-amber-50 border-amber-400 text-amber-700"
                                  : "bg-gray-100 border-gray-300 text-gray-500"
                              }`}
                              style={{ fontWeight: 700 }}
                            >
                              {person.initials}
                            </div>

                            {/* 정보 */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{person.name}</p>
                                {/* 상태 뱃지 */}
                                {isDone && (
                                  <span className="flex items-center gap-0.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full shrink-0">
                                    <Check size={9} />기안
                                  </span>
                                )}
                                {isPending && (
                                  <span className="flex items-center gap-0.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
                                    <Clock size={9} />검토 대기
                                  </span>
                                )}
                                {person.status === "waiting" && (
                                  <span className="flex items-center gap-0.5 text-xs text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full shrink-0">
                                    <Clock size={9} />대기 중
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{person.role} · {person.title}</p>
                              <p className="text-xs text-gray-400">{person.dept}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {showSubmitModal && (
      <SubmitConfirmModal
        formType={selectedForm}
        approvers={approvers.map((a) => ({ name: a.name, title: a.title }))}
        onConfirm={handleConfirmSubmit}
        onClose={() => setShowSubmitModal(false)}
      />
    )}
    </>
  );
}
