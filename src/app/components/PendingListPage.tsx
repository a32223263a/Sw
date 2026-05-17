import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  ListChecks,
  ChevronDown,
  Eye,
  ShieldAlert,
  X,
  Fingerprint,
  Lock,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

/* ─── Mock Data ─── */
type RiskLevel = "HIGH" | "LOW" | "MEDIUM";
type PendingDoc = {
  id: string;
  docNo: string;
  title: string;
  form: string;
  requester: string;
  dept: string;
  risk: RiskLevel;
  date: string;
  canBatch: boolean; // HIGH 문서는 false
};

const PENDING_DOCS: PendingDoc[] = [
  { id: "1", docNo: "2026-IT-00201", title: "2026년 3분기 IT 인프라 고도화 사업 예산 집행 품의", form: "예산 집행 품의서", requester: "박도윤", dept: "IT기획팀", risk: "HIGH", date: "2026-05-05", canBatch: false },
  { id: "2", docNo: "2026-IT-00198", title: "출장 신청서 — 대전 R&D 센터 방문", form: "출장 신청서", requester: "홍길동", dept: "IT기획팀", risk: "LOW", date: "2026-05-04", canBatch: true },
  { id: "3", docNo: "2026-IT-00196", title: "비품 구매 요청서 — 사무용 의자 4개", form: "구매 요청서", requester: "홍길동", dept: "IT기획팀", risk: "LOW", date: "2026-05-03", canBatch: true },
  { id: "4", docNo: "2026-IT-00194", title: "업무 협조 요청 — 회의실 예약 시스템 연동", form: "업무 협조 요청서", requester: "이민준", dept: "IT기획팀", risk: "LOW", date: "2026-05-02", canBatch: true },
  { id: "5", docNo: "2026-IT-00190", title: "2분기 서버 보안 패치 계획 검토 요청", form: "업무 협조 요청서", requester: "최유리", dept: "보안팀", risk: "MEDIUM", date: "2026-05-01", canBatch: true },
  { id: "6", docNo: "2026-IT-00185", title: "외부 강사 계약 체결 품의", form: "계약 체결 품의서", requester: "김태현", dept: "인재개발팀", risk: "MEDIUM", date: "2026-04-30", canBatch: true },
];

const RISK_BADGE: Record<RiskLevel, { label: string; color: string }> = {
  HIGH: { label: "🔴 HIGH", color: "bg-red-50 text-red-700 border-red-200" },
  MEDIUM: { label: "🟡 MEDIUM", color: "bg-amber-50 text-amber-700 border-amber-200" },
  LOW: { label: "🟢 LOW", color: "bg-green-50 text-green-700 border-green-200" },
};

/* ─── High Risk Block Modal ─── */
function HighRiskBlockModal({
  highRiskCount,
  onClose,
}: {
  highRiskCount: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-[480px] overflow-hidden border border-red-200"
        initial={{ opacity: 0, scale: 0.93, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center shrink-0">
              <ShieldAlert size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900">보안 정책에 의해 일괄 승인이 차단되었습니다.</h3>
              <p className="text-xs text-red-600 mt-0.5">422 HIGH_RISK_DOCUMENT_INCLUDED</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-100 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* 에러 메시지 */}
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-4">
            <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm text-red-800" style={{ fontWeight: 600 }}>
                고위험 문서({highRiskCount}건)는 일괄 결재할 수 없습니다.
              </p>
              <p className="text-xs text-red-700 leading-relaxed">
                보안 정책에 따라 개별 열람 및 2차 인증(2FA)을 진행해 주세요.
              </p>
            </div>
          </div>

          {/* API 에러 코드 표시 (ADR 추적성 증명) */}
          <div className="bg-gray-900 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">API 응답</p>
            <p className="font-mono text-xs text-red-400">422 HIGH_RISK_DOCUMENT_INCLUDED</p>
            <p className="font-mono text-xs text-gray-500 mt-0.5">
              {"{ \"blocked\": ["}{PENDING_DOCS.find(d => d.risk === "HIGH")?.docNo}
              {"], \"reason\": \"HIGH_RISK_REQUIRES_INDIVIDUAL_REVIEW\" }"}
            </p>
          </div>

          {/* 해결 방법 안내 */}
          <div className="space-y-2">
            <p className="text-xs text-gray-600" style={{ fontWeight: 600 }}>해결 방법</p>
            {[
              { step: "1", text: "선택에서 고위험 문서(🔴)를 해제합니다." },
              { step: "2", text: "남은 일반/중위험 문서를 일괄 승인합니다." },
              { step: "3", text: "고위험 문서는 개별 클릭 후 2FA 인증으로 승인합니다." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center shrink-0 mt-0.5" style={{ fontWeight: 700 }}>
                  {item.step}
                </span>
                <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <ArrowRight size={13} /> 선택 초기화 및 개별 결재 진행하기
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Batch Auth Modal (simplified) ─── */
function BatchAuthModal({
  count,
  onSuccess,
  onClose,
}: {
  count: number;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);

  const handleInput = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) {
      const inputs = document.querySelectorAll<HTMLInputElement>(".otp-input");
      inputs[idx + 1]?.focus();
    }
  };

  const verify = () => {
    if (otp.join("").length < 6) return;
    setVerifying(true);
    setTimeout(() => { setVerifying(false); onSuccess(); }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-[400px] overflow-hidden border border-gray-200"
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <div className="px-6 py-5 border-b border-gray-200 bg-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Fingerprint size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white">일괄 승인 인증</h3>
              <p className="text-xs text-blue-200 mt-0.5">{count}건의 문서를 일괄 승인합니다</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">OTP 앱의 6자리 코드를 입력하세요. (데모: 아무 숫자 6자리)</p>
          <div className="flex gap-2 justify-center">
            {otp.map((d, i) => (
              <input
                key={i}
                className={`otp-input w-10 h-11 text-center text-lg border-2 rounded-lg focus:outline-none transition-all ${d ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 focus:border-blue-400"}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleInput(i, e.target.value)}
              />
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">취소</button>
          <button
            onClick={verify}
            disabled={otp.join("").length < 6 || verifying}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-all ${otp.join("").length >= 6 && !verifying ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
          >
            {verifying ? <><RefreshCw size={13} className="animate-spin" /> 인증 중...</> : <><ShieldCheck size={13} /> 인증 확인</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Page ─── */
export function PendingListPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "ALL">("ALL");
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [batchDone, setBatchDone] = useState(false);
  const [batchCount, setBatchCount] = useState(0);

  const filteredDocs = PENDING_DOCS.filter(
    (d) => riskFilter === "ALL" || d.risk === riskFilter
  );

  const batchableDocs = filteredDocs.filter((d) => d.canBatch);
  const batchableIds = new Set(batchableDocs.map((d) => d.id));
  const selectedBatchable = [...selected].filter((id) => batchableIds.has(id));
  const hasHighRiskSelected = [...selected].some(
    (id) => PENDING_DOCS.find((d) => d.id === id)?.risk === "HIGH"
  );

  const toggleDoc = (id: string) => {
    const doc = PENDING_DOCS.find((d) => d.id === id);
    if (!doc || !doc.canBatch) return;
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selectedBatchable.length === batchableDocs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(batchableDocs.map((d) => d.id)));
    }
  };

  const handleBatchClick = () => {
    if (hasHighRiskSelected) {
      setShowBlockModal(true);
      return;
    }
    if (selectedBatchable.length === 0) return;
    setShowBatchModal(true);
  };

  if (batchDone) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 shadow-xl p-10 text-center w-96"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <ListChecks size={30} className="text-emerald-600" />
          </div>
          <h3 className="text-gray-800 mb-1">일괄 승인 완료</h3>
          <p className="text-sm text-gray-500 mb-6">{batchCount}건의 문서가 모두 승인 처리되었습니다.</p>
          <button onClick={() => { setBatchDone(false); setSelected(new Set()); }} className="w-full py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">결재 대기함으로 돌아가기</button>
        </motion.div>
      </div>
    );
  }

  const allBatchSelected = batchableDocs.length > 0 && selectedBatchable.length === batchableDocs.length;
  const someBatchSelected = selectedBatchable.length > 0 && !allBatchSelected;

  return (
    <>
      <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-gray-900">결재 대기함</h2>
            <p className="text-sm text-gray-500 mt-1">내 결재 순서의 대기 문서 목록입니다.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Clock size={12} />
            <span>총 {PENDING_DOCS.length}건 대기</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "전체 대기", value: PENDING_DOCS.length, color: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "🔴 고위험", value: PENDING_DOCS.filter((d) => d.risk === "HIGH").length, color: "bg-red-50 border-red-200 text-red-700" },
            { label: "🟡 중위험", value: PENDING_DOCS.filter((d) => d.risk === "MEDIUM").length, color: "bg-amber-50 border-amber-200 text-amber-700" },
            { label: "🟢 저위험", value: PENDING_DOCS.filter((d) => d.risk === "LOW").length, color: "bg-green-50 border-green-200 text-green-700" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border p-4 ${stat.color}`}>
              <p style={{ fontWeight: 700, fontSize: "1.5rem", lineHeight: 1 }}>{stat.value}</p>
              <p className="text-xs mt-1 opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-gray-500" />
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
              {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-3 py-1.5 text-xs transition-colors ${riskFilter === r ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  {r === "ALL" ? "전체" : RISK_BADGE[r].label}
                </button>
              ))}
            </div>
          </div>

          {/* Batch actions */}
          <div className="flex items-center gap-2">
            {selectedBatchable.length > 0 && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span className="text-xs text-gray-500">
                  <strong className="text-emerald-600">{selectedBatchable.length}건</strong> 선택됨
                </span>
                <button onClick={() => setSelected(new Set())} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={13} />
                </button>
              </motion.div>
            )}
            <button
              onClick={handleBatchClick}
              disabled={selectedBatchable.length === 0}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all ${
                selectedBatchable.length > 0
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ListChecks size={14} />
              일괄 승인 {selectedBatchable.length > 0 && `(${selectedBatchable.length}건)`}
            </button>
          </div>
        </div>

        {/* 고위험 일괄 차단 안내 */}
        <AnimatePresence>
          {hasHighRiskSelected && (
            <motion.div
              className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <ShieldAlert size={14} className="text-red-600 shrink-0" />
              <p className="text-xs text-red-700">
                <strong>고위험 문서가 선택에 포함되어 있습니다.</strong> 고위험 문서는 일괄 결재할 수 없으며 개별 열람 후 승인해야 합니다.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-500" style={{ fontWeight: 600 }}>
            {/* Checkbox all */}
            <div
              className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center shrink-0 transition-all ${
                allBatchSelected
                  ? "bg-emerald-500 border-emerald-500"
                  : "border-gray-400"
              }`}
              onClick={toggleAll}
            >
              {allBatchSelected && <CheckCircle2 size={11} className="text-white" />}
              {someBatchSelected && <div className="w-2 h-0.5 bg-gray-500 rounded" />}
            </div>
            <span className="flex-[2]">제목</span>
            <span className="flex-[1]">기안자</span>
            <span className="flex-[1]">위험 등급</span>
            <span className="flex-[1]">기안일</span>
            <span className="w-16 text-center">열람</span>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Clock size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">해당 조건의 대기 문서가 없습니다.</p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = selected.has(doc.id);
              const badge = RISK_BADGE[doc.risk];
              return (
                <motion.div
                  key={doc.id}
                  layout
                  className={`flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 transition-colors ${
                    isSelected ? "bg-emerald-50" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                      !doc.canBatch
                        ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                        : isSelected
                        ? "bg-emerald-500 border-emerald-500 cursor-pointer"
                        : "border-gray-300 cursor-pointer hover:border-emerald-400"
                    }`}
                    onClick={() => toggleDoc(doc.id)}
                    title={!doc.canBatch ? "고위험 문서는 개별 결재가 필요합니다" : undefined}
                  >
                    {isSelected && <CheckCircle2 size={11} className="text-white" />}
                    {!doc.canBatch && <Lock size={9} className="text-gray-400" />}
                  </div>

                  {/* Title */}
                  <div className="flex-[2] min-w-0 cursor-pointer" onClick={() => doc.id === "1" && navigate("/pending/1")}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 500 }}>{doc.title}</p>
                      {doc.risk === "HIGH" && (
                        <span className="shrink-0 flex items-center gap-1 text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                          <AlertTriangle size={9} /> 고위험
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.docNo} · {doc.form}</p>
                  </div>

                  {/* Requester */}
                  <span className="flex-[1] text-xs text-gray-600">{doc.requester} ({doc.dept})</span>

                  {/* Risk badge */}
                  <div className="flex-[1]">
                    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Date */}
                  <span className="flex-[1] text-xs text-gray-500">{doc.date}</span>

                  {/* Action */}
                  <div className="w-16 flex justify-center">
                    <button
                      onClick={() => doc.id === "1" && navigate("/pending/1")}
                      className={`w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors ${doc.id === "1" ? "" : "opacity-50 cursor-default"}`}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Bottom info */}
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <ShieldAlert size={12} className="text-blue-500 shrink-0" />
          <p className="text-blue-700 leading-relaxed">
            일괄 승인은 저위험·중위험 문서에만 적용됩니다. 고위험 문서가 포함된 경우 일괄 승인이 차단되며, 개별 결재로 진행해 주세요.
          </p>
        </div>
      </div>
      </div>

      {/* Batch Auth Modal */}
      {showBatchModal && (
        <BatchAuthModal
          count={selectedBatchable.length}
          onSuccess={() => {
            setBatchCount(selectedBatchable.length);
            setShowBatchModal(false);
            setBatchDone(true);
          }}
          onClose={() => setShowBatchModal(false)}
        />
      )}

      {/* High Risk Block Modal */}
      {showBlockModal && (
        <HighRiskBlockModal
          highRiskCount={[...selected].filter((id) => PENDING_DOCS.find((d) => d.id === id)?.risk === "HIGH").length}
          onClose={() => setShowBlockModal(false)}
        />
      )}
    </>
  );
}