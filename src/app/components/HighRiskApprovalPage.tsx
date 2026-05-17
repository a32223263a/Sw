import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  ChevronRight,
  AlertTriangle,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Eye,
  ArrowDown,
  Fingerprint,
  Clock,
  Paperclip,
  User,
  Hash,
  FileText,
  CalendarDays,
  ThumbsDown,
  ThumbsUp,
  ShieldCheck,
  RefreshCw,
  Timer,
  Info,
  ChevronDown,
} from "lucide-react";

/* ─────────────────────────────────────────────────
   Mock document content
───────────────────────────────────────────────── */
const DOC_SECTIONS = [
  {
    heading: "1. 개요",
    body: `본 품의서는 2026년 3분기(7월~9월) IT 인프라 고도화 사업의 예산 집행을 위해 작성되었습니다. 해당 예산은 전사 핵심 시스템의 안정성 향상 및 사이버 보안 강화를 목적으로 하며, 이사회 승인을 통해 반영된 연간 예산 범위 내에서 집행됩니다.`,
  },
  {
    heading: "2. 집행 배경 및 필요성",
    body: `현재 운영 중인 온프레미스(On-Premise) 서버 인프라는 2019년 도입 이후 7년째 운영되어 노후화가 심각한 수준입니다. 전년도 가용성 SLA(Service Level Agreement) 목표치 99.9% 대비 실제 달성률이 98.7%에 그쳐 연간 약 112시간의 비계획 다운타임이 발생하였으며, 이로 인한 업무 손실 및 기회비용이 연 2억 3천만 원으로 추산됩니다.

또한 보안 감사 결과, 레거시 OS 및 미패치 취약점으로 인한 위험 수준이 '높음(High)' 등급을 유지하고 있어 즉각적인 조치가 필요한 상황입니다. 개인정보 보호법 및 정보통신망법 준수를 위해서도 인프라 현대화는 선택이 아닌 필수 과제입니다.`,
  },
  {
    heading: "3. 예산 집행 상세",
    body: `아래 표는 3분기 IT 인프라 고도화 사업의 항목별 예산 내역입니다.

  ■ 서버 인프라 교체 (하이퍼컨버지드 인프라)
    - 벤더: Dell Technologies / HPE
    - 수량: 12노드 클러스터 구성
    - 예산: 4억 8,000만 원

  ■ 네트워크 장비 업그레이드 (SDN 전환)
    - 벤더: Cisco / Arista
    - 구성: Core 2대, Distribution 4대, Access 24대
    - 예산: 1억 9,500만 원

  ■ 사이버보안 강화 (EDR/XDR 솔루션 도입)
    - 벤더: CrowdStrike / SentinelOne (입찰 진행 중)
    - 대상: 전사 엔드포인트 1,240대
    - 예산: 1억 2,000만 원

  ■ 클라우드 마이그레이션 컨설팅
    - 벤더: 삼성SDS / LG CNS (우선협상)
    - 범위: 비핵심 업무 시스템 AWS/GCP 이전
    - 예산: 7,500만 원

  ■ 재해복구(DR) 체계 구축
    - 구성: Active-Active 이중화, RPO 1시간 / RTO 4시간
    - 예산: 3억 2,000만 원

  ──────────────────────────────────────────────
  소계: 11억 9,000만 원
  예비비 (5%): 5,950만 원
  합계 (VAT 별도): 12억 4,950만 원
  ──────────────────────────────────────────────`,
  },
  {
    heading: "4. 조달 계획 및 일정",
    body: `조달은 「국가계약법」 및 사내 「IT 구매 규정」에 따라 공개경쟁입찰을 원칙으로 진행합니다. 단, 긴급성이 인정되는 DR 구축 항목의 경우 제한경쟁입찰을 적용하며, 이에 대한 사유서를 별첨으로 첨부합니다.

  • 2026.07.01 ~ 07.15: RFP 발송 및 벤더 제안서 접수
  • 2026.07.16 ~ 07.25: 기술평가 및 가격협상
  • 2026.07.28: 최종 벤더 선정 및 계약 체결
  • 2026.08.01 ~ 09.30: 장비 납품 및 설치/구성
  • 2026.10.01 ~ 10.15: 안정화 테스트 및 인수 검사`,
  },
  {
    heading: "5. 위험 요인 분석",
    body: `고위험 문서로 분류된 근거 및 주요 위험 요인은 다음과 같습니다.

  [위험 수준: 🔴 높음]
  - 단일 집행 금액 12억 원 초과 → 이사회 사전 승인 필요 (완료)
  - 핵심 운영 시스템 마이그레이션 포함 → 업무 중단 가능성 존재
  - 글로벌 공급망 이슈로 인한 납기 지연 위험 (반도체 수급 불안)
  - 복수 벤더 연동 리스크 → 통합 테스트 일정 타이트

  [위험 완화 방안]
  - 단계적 마이그레이션 적용 (블루/그린 배포 전략)
  - 납기 지연 패널티 조항 계약서 명시
  - 외부 PMO 선임을 통한 프로젝트 거버넌스 강화
  - 비상 복구 절차(ERP) 사전 수립 및 훈련 실시`,
  },
  {
    heading: "6. 결론 및 요청사항",
    body: `상기 내용을 충분히 검토하신 후, 2026년 3분기 IT 인프라 고도화 사업 예산 집행에 대한 결재를 요청드립니다.

본 사업은 전사 디지털 전환(DX) 로드맵의 핵심 마일스톤이며, 7월 이내 집행이 이루어지지 않을 경우 연내 구축 완료가 불가능하여 하반기 사업 목표 달성에 중대한 영향을 미칠 수 있습니다.

모든 관련 근거 자료(이사회 의결서, 예산 배정 공문, 벤더 견적서 3개사, 보안 감사 결과 보고서)는 첨부파일을 통해 확인하실 수 있습니다.

감사합니다.

IT 인프라팀 박도윤 드림`,
  },
];

/* ─────────────────────────────────────────────────
   2FA Modal
───────────────────────────────────────────────── */
function TwoFAModal({
  onSuccess,
  onClose,
}: {
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "verifying" | "error">("idle");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setStatus("idle");
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setStatus("verifying");
    setTimeout(() => {
      // Accept any 6-digit code as valid for demo
      setStatus("idle");
      onSuccess();
    }, 1200);
  };

  const filled = otp.every((d) => d !== "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden border border-gray-200"
        initial={{ opacity: 0, scale: 0.93, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                <Fingerprint size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white">2단계 인증 (2FA)</h3>
                <p className="text-xs text-blue-200 mt-0.5">고위험 문서 결재 전 신원 재확인</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-white/70 hover:bg-white/20 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Notice */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3">
            <ShieldAlert size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>고위험 문서</strong>는 결재 전 2FA 인증이 필수입니다. OTP 앱의 6자리 코드를 입력하세요. (데모: 아무 숫자 6자리)
            </p>
          </div>

          {/* OTP input */}
          <div className="space-y-3">
            <label className="text-sm text-gray-700">인증 코드 입력</label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-11 h-12 text-center text-lg border-2 rounded-lg focus:outline-none transition-all ${
                    digit
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-800 focus:border-blue-400"
                  } ${status === "error" ? "border-red-400 bg-red-50" : ""}`}
                />
              ))}
            </div>
            {status === "error" && (
              <p className="text-center text-xs text-red-600 flex items-center justify-center gap-1">
                <AlertTriangle size={11} /> 인증 코드가 올바르지 않습니다. 다시 입력하세요.
              </p>
            )}
          </div>

          {/* Timer hint */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Timer size={12} />
            <span>OTP는 30초마다 갱신됩니다</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            취소
          </button>
          <button
            onClick={handleVerify}
            disabled={!filled || status === "verifying"}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg transition-all ${
              filled && status !== "verifying"
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {status === "verifying" ? (
              <><RefreshCw size={13} className="animate-spin" /> 검증 중...</>
            ) : (
              <><ShieldCheck size={13} /> 인증 확인</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Approve Confirm Modal
───────────────────────────────────────────────── */
function ApproveConfirmModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  const [comment, setComment] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-[460px] overflow-hidden border border-gray-200"
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <div className="px-6 py-5 border-b border-gray-200 bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <ThumbsUp size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-gray-800">결재 승인</h3>
              <p className="text-xs text-emerald-700 mt-0.5">2026년 3분기 예산 집행 품의</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-3 text-xs text-blue-800 leading-relaxed">
            승인 후 다음 결재자 <strong>이수연 부장</strong>에게 자동 전달됩니다.
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-gray-700">의견 (선택)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="승인 의견을 남길 수 있습니다."
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">취소</button>
          <button onClick={onConfirm} className="flex items-center gap-2 px-6 py-2.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
            <CheckCircle2 size={13} /> 승인 확정
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Reject Modal
───────────────────────────────────────────────── */
const REJECT_REASONS = ["예산 규모 재검토 필요", "근거 자료 보완 요청", "상위 기관 승인 선행 필요", "직접 입력"];
type RejectTarget = "WRITER" | "PREV_APPROVER";

function RejectModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [target, setTarget] = useState<RejectTarget>("WRITER");
  const MIN_LENGTH = 10;
  const canConfirm = reason.trim().length >= MIN_LENGTH;
  const remaining = MIN_LENGTH - reason.trim().length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-2xl shadow-2xl w-[500px] overflow-hidden border border-gray-200"
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <div className="px-6 py-5 border-b border-gray-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center">
              <ThumbsDown size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-gray-800">결재 반려</h3>
              <p className="text-xs text-red-600 mt-0.5">반려 사유를 필수로 입력해야 합니다 (최소 10자)</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* 반려 사유 템플릿 */}
          <div className="flex flex-wrap gap-1.5">
            {REJECT_REASONS.map((r) => (
              <button key={r} onClick={() => setReason(r === "직접 입력" ? "" : r)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${reason === r ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-600 border-gray-300 hover:border-red-400 hover:text-red-600"}`}>
                {r}
              </button>
            ))}
          </div>

          {/* 반려 사유 입력 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">반려 사유 <span className="text-red-500">*</span></label>
              <span className={`text-xs ${reason.trim().length >= MIN_LENGTH ? "text-emerald-600" : "text-gray-400"}`}>
                {reason.trim().length}/{MIN_LENGTH}자 이상
              </span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="반려 사유를 입력하세요 (최소 10자)"
              className={`w-full px-3 py-2.5 text-sm border rounded-lg resize-none focus:outline-none transition-all ${
                reason.trim().length > 0 && !canConfirm
                  ? "border-amber-400 bg-amber-50 focus:ring-2 focus:ring-amber-100"
                  : canConfirm
                  ? "border-emerald-400 bg-emerald-50 focus:ring-2 focus:ring-emerald-100"
                  : "border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
              }`}
            />
            {reason.trim().length > 0 && !canConfirm && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle size={11} />{remaining}자 더 입력해야 합니다.
              </p>
            )}
          </div>

          {/* 반려 대상 선택 (UC-APP-02 A2/A3) */}
          <div className="space-y-2">
            <label className="text-sm text-gray-700">반려 대상 <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTarget("WRITER")}
                className={`px-4 py-3 rounded-lg border text-left transition-all ${target === "WRITER" ? "bg-red-50 border-red-400 text-red-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
              >
                <p className="text-xs" style={{ fontWeight: 600 }}>기안자에게 반려</p>
                <p className="text-xs text-gray-400 mt-0.5">문서 상태: REJECTED</p>
              </button>
              <button
                onClick={() => setTarget("PREV_APPROVER")}
                className={`px-4 py-3 rounded-lg border text-left transition-all ${target === "PREV_APPROVER" ? "bg-amber-50 border-amber-400 text-amber-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
              >
                <p className="text-xs" style={{ fontWeight: 600 }}>이전 결재자에게 반려</p>
                <p className="text-xs text-gray-400 mt-0.5">문서 상태: IN_PROGRESS 유지</p>
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {target === "WRITER"
                ? "기안자 박도윤에게 반려 알림이 발송되며 반려함으로 이동됩니다."
                : "이전 결재자의 대기함으로 문서가 돌아갑니다. (이 문서는 1차 결재자이므로 기안자에게 반려됩니다.)"}
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">취소</button>
          <button onClick={() => canConfirm && onConfirm()} disabled={!canConfirm}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg transition-all ${canConfirm ? "bg-red-600 text-white hover:bg-red-700 shadow-sm" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
            <ThumbsDown size={13} /> 반려 확정
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────── */
export function HighRiskApprovalPage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll state
  const [scrollPct, setScrollPct] = useState(0);
  const [scrollDone, setScrollDone] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  // 2FA state
  type TwoFAState = "expired" | "active";
  const [twoFAState, setTwoFAState] = useState<TwoFAState>("expired");
  const [sessionTimer, setSessionTimer] = useState(1800); // 30 min in seconds
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  // Scroll tracking
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const pct = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
    setScrollPct(Math.min(pct, 100));
    if (pct >= 95) {
      setScrollDone(true);
      setShowScrollHint(false);
    }
  }, []);

  // Session countdown
  useEffect(() => {
    if (twoFAState !== "active") return;
    const t = setInterval(() => {
      setSessionTimer((p) => {
        if (p <= 1) { setTwoFAState("expired"); clearInterval(t); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [twoFAState]);

  const fmtTimer = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const canApprove = scrollDone && twoFAState === "active";

  const missingReasons: string[] = [];
  if (!scrollDone) missingReasons.push("문서 전체 열람 (스크롤 미완료)");
  if (twoFAState !== "active") missingReasons.push("2FA 재인증 필요");

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-full">
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 shadow-xl p-10 text-center w-96"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${done === "rejected" ? "bg-red-100 border-2 border-red-200" : "bg-emerald-100 border-2 border-emerald-200"}`}>
            {done === "rejected"
              ? <ThumbsDown size={30} className="text-red-600" />
              : <CheckCircle2 size={32} className="text-emerald-600" />}
          </div>
          <h3 className="text-gray-800 mb-1">
            {done === "approved" ? "승인 완료" : "반려 완료"}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {done === "approved"
              ? "다음 결재자 이수연 부장에게 자동 전달됩니다."
              : "기안자 박도윤에게 반려 알림이 발송됩니다."}
          </p>
          <button onClick={() => navigate("/pending")} className="w-full py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">결재 대기함으로 이동</button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* ── Page Header ── */}
        <div className="px-6 pt-5 pb-0 shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
            <span onClick={() => navigate("/pending")} className="hover:text-blue-600 cursor-pointer transition-colors">결재 대기함</span>
            <ChevronRight size={13} />
            <span className="text-gray-800" style={{ fontWeight: 600 }}>2026년 3분기 예산 집행 품의</span>
            <span className="flex items-center gap-1 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full ml-1">
              <AlertTriangle size={10} /> 고위험
            </span>
          </div>

          {/* Doc title bar */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-gray-900">2026년 3분기 IT 인프라 고도화 사업 예산 집행 품의</h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-gray-500"><User size={11} /> 기안자: 박도윤 대리 · IT기획팀</span>
                <span className="flex items-center gap-1 text-xs text-gray-500"><CalendarDays size={11} /> 2026-05-05</span>
                <span className="flex items-center gap-1 text-xs text-gray-500"><Hash size={11} /> 2026-IT-00201</span>
                <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                  <FileText size={10} /> 예산 집행 품의서
                </span>
                <span className="flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                  <ShieldAlert size={10} /> 12억 4,950만원 규모
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Content Area (flex-1, two-column) ── */}
        <div className="flex flex-1 gap-5 px-6 pb-0 min-h-0">

          {/* ─── Document Viewer (scrollable) ─── */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-white rounded-t-lg border border-gray-200 border-b-0 shrink-0">
              {/* Viewer header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>문서 본문</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Scroll progress */}
                  <div className="flex items-center gap-2">
                    <div className="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full transition-colors ${scrollDone ? "bg-emerald-500" : "bg-blue-500"}`}
                        animate={{ width: `${scrollPct}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <span className={`text-xs ${scrollDone ? "text-emerald-600" : "text-gray-500"}`}>
                      {scrollDone ? "✓ 전체 열람" : `${scrollPct}% 열람`}
                    </span>
                  </div>
                  {scrollDone && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} /> 완료
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="relative flex-1 min-h-0">
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="absolute inset-0 overflow-y-auto bg-gray-50 border border-gray-200 border-t-0 rounded-b-lg"
              >
                {/* ── 공문서 HTML 렌더링 뷰어 (content 스냅샷) ── */}
                <div className="p-5 space-y-4">
                  {/* 문서 헤더 (회사 서식) */}
                  <div className="border border-gray-300 overflow-hidden rounded-sm bg-white">
                    {/* 상단: 로고 + 제목 + 결재란 */}
                    <div className="flex items-start justify-between px-6 py-4 border-b border-gray-300 bg-white gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-blue-700 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs" style={{ fontWeight: 700 }}>CORP</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">전자결재 시스템 · 고위험 문서</p>
                          <h3 className="text-gray-900" style={{ fontWeight: 700 }}>예산 집행 품의서</h3>
                        </div>
                      </div>
                      {/* 결재란 */}
                      <div className="flex flex-col items-end shrink-0">
                        <p className="text-xs text-gray-400 mb-1">결재</p>
                        <div className="border border-gray-400 overflow-hidden">
                          <div className="flex">
                            {["기안자", "1차 결재", "2차 결재"].map((label) => (
                              <div key={label} className="border-r border-gray-400 last:border-r-0 px-3 py-1 bg-gray-50 text-center" style={{ minWidth: 56 }}>
                                <p className="text-xs text-gray-600" style={{ fontWeight: 600 }}>{label}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex" style={{ minHeight: 36 }}>
                            {[{ name: "박도윤", title: "대리" }, { name: "김기훈", title: "팀장" }, { name: "이수연", title: "부장" }].map((person) => (
                              <div key={person.name} className="flex-1 border-r border-gray-400 last:border-r-0 bg-white flex items-center justify-center py-1 px-2">
                                <div className="text-center">
                                  <p className="text-xs text-gray-800" style={{ fontWeight: 600 }}>{person.name}</p>
                                  <p className="text-xs text-gray-500">{person.title}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* 문서 메타 행 */}
                    <div className="grid grid-cols-4 text-xs border-b border-gray-300">
                      {[
                        { label: "작 성 일", value: "2026-05-05" },
                        { label: "부 서 명", value: "IT 기획팀" },
                        { label: "기 안 자", value: "박도윤 대리" },
                        { label: "문서 번호", value: "2026-IT-00201" },
                      ].map((item, i) => (
                        <div key={i} className={`flex ${i < 3 ? "border-r border-gray-300" : ""}`}>
                          <div className="bg-gray-50 border-r border-gray-300 px-2 py-1.5 shrink-0 flex items-center text-gray-600" style={{ fontWeight: 600, minWidth: 58 }}>
                            {item.label}
                          </div>
                          <div className="flex-1 px-2 py-1.5 bg-white text-gray-800 flex items-center">{item.value}</div>
                        </div>
                      ))}
                    </div>
                    {/* 고위험 배너 */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-200">
                      <ShieldAlert size={13} className="text-red-600" />
                      <span className="text-xs text-red-700" style={{ fontWeight: 600 }}>고위험 문서 — 본문 전체 열람 및 2FA 인증 후 승인 가능</span>
                      <span className="ml-auto text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">12억 4,950만원 규모</span>
                    </div>
                  </div>

                  {/* 본문 섹션들 (HTML 렌더링) */}
                  <div className="bg-white border border-gray-200 rounded-sm px-6 py-5 space-y-6">
                    {DOC_SECTIONS.map((sec, i) => (
                      <div key={i}>
                        <div className="bg-gray-100 border-l-4 border-blue-600 px-3 py-1.5 mb-3">
                          <h4 className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{sec.heading}</h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-2">{sec.body}</p>
                      </div>
                    ))}
                  </div>

                  {/* 서명란 */}
                  <div className="flex justify-end bg-white border border-gray-200 rounded-sm px-6 py-4">
                    <div className="text-right space-y-1">
                      <p className="text-xs text-gray-400">위와 같이 결재를 요청합니다.</p>
                      <p className="text-xs text-gray-500">2026년 5월 5일</p>
                      <p className="text-sm text-gray-700" style={{ fontWeight: 600 }}>IT 기획팀 박도윤 대리 올림</p>
                    </div>
                  </div>

                  {/* 첨부파일 */}
                  <div className="bg-white border border-gray-200 rounded-sm px-6 py-4">
                    <p className="text-xs text-gray-500 mb-3" style={{ fontWeight: 600 }}>첨부파일</p>
                    {[
                      { name: "이사회의결서_2026Q3.pdf", size: "2.1 MB" },
                      { name: "예산배정공문_IT인프라.pdf", size: "890 KB" },
                      { name: "벤더견적서_비교표.xlsx", size: "1.4 MB" },
                      { name: "보안감사결과보고서.pdf", size: "3.2 MB" },
                    ].map((f) => (
                      <div key={f.name} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer py-1">
                        <Paperclip size={13} className="text-gray-400" />
                        <span className="underline underline-offset-2">{f.name}</span>
                        <span className="text-xs text-gray-400">({f.size})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scroll anchor */}
                <div className="h-4" />
              </div>

              {/* Floating scroll hint */}
              <AnimatePresence>
                {showScrollHint && !scrollDone && (
                  <motion.div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                  >
                    <div className="flex items-center gap-2 bg-gray-900/90 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm">
                      <motion.div
                        animate={{ y: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                      >
                        <ArrowDown size={13} />
                      </motion.div>
                      <span>스크롤을 끝까지 내려야 승인할 수 있습니다 ({scrollPct}%)</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── Right Panel ─── */}
          <div className="w-64 flex flex-col gap-4 shrink-0 overflow-y-auto pb-4">
            {/* Constraint checklist */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert size={14} className="text-red-500" />
                <span className="text-sm text-gray-700" style={{ fontWeight: 600 }}>승인 조건 확인</span>
              </div>
              <div className="space-y-2.5">
                {/* Scroll condition */}
                <div className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 border transition-colors ${scrollDone ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${scrollDone ? "bg-emerald-500" : "bg-gray-300"}`}>
                    {scrollDone ? <CheckCircle2 size={12} className="text-white" /> : <Eye size={11} className="text-white" />}
                  </div>
                  <div>
                    <p className={`text-xs ${scrollDone ? "text-emerald-700" : "text-gray-500"}`} style={{ fontWeight: 600 }}>
                      {scrollDone ? "문서 전체 열람 완료" : "문서 전체 열람 필요"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {scrollDone ? "스크롤 100% 완료" : `현재 ${scrollPct}% 열람`}
                    </p>
                  </div>
                </div>

                {/* 2FA condition */}
                <div className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 border transition-colors ${twoFAState === "active" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${twoFAState === "active" ? "bg-emerald-500" : "bg-red-500"}`}>
                    {twoFAState === "active" ? <ShieldCheck size={11} className="text-white" /> : <Lock size={11} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${twoFAState === "active" ? "text-emerald-700" : "text-red-700"}`} style={{ fontWeight: 600 }}>
                      {twoFAState === "active" ? "2FA 인증 활성" : "2FA 세션 만료"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {twoFAState === "active" ? `세션 잔여 ${fmtTimer(sessionTimer)}` : "재인증이 필요합니다"}
                    </p>
                    {twoFAState === "expired" && (
                      <button
                        onClick={() => setShow2FAModal(true)}
                        className="mt-1.5 flex items-center gap-1 text-xs text-red-600 hover:text-red-800 underline underline-offset-2 transition-colors"
                      >
                        <Fingerprint size={11} /> 지금 재인증
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Overall status */}
              <div className={`mt-3 rounded-md px-3 py-2 text-xs flex items-center gap-2 border ${canApprove ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                {canApprove ? <Unlock size={11} /> : <Lock size={11} />}
                <span style={{ fontWeight: 600 }}>{canApprove ? "승인 버튼 활성화됨" : `${missingReasons.length}개 조건 미충족`}</span>
              </div>
            </div>

            {/* 2FA Re-auth card (when expired) */}
            {twoFAState === "expired" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={13} className="text-red-600" />
                  <span className="text-xs text-red-700" style={{ fontWeight: 600 }}>2FA 세션 만료</span>
                </div>
                <p className="text-xs text-red-600 mb-3 leading-relaxed">
                  인증 세션이 만료되었습니다. 고위험 문서 결재를 위해 재인증이 필요합니다.
                </p>
                <button
                  onClick={() => setShow2FAModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  <Fingerprint size={14} /> 2FA 재인증
                </button>
              </div>
            )}

            {/* Doc info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2.5">
              <h4 className="text-gray-700">결재 정보</h4>
              {[
                { label: "내 역할", value: "1차 결재자" },
                { label: "다음 결재자", value: "이수연 부장" },
                { label: "예산 규모", value: "12억 4,950만원" },
                { label: "위험 등급", value: "🔴 HIGH" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-xs text-gray-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Action Bar ── */}
        <div className="shrink-0 mx-6 mb-5 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex items-center justify-between gap-4 shadow-sm">
            {/* Status indicators */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* 2FA status */}
              <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border ${twoFAState === "active" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                {twoFAState === "active"
                  ? <><ShieldCheck size={14} /> <span className="text-xs">2FA 인증 활성 ({fmtTimer(sessionTimer)})</span></>
                  : <><Lock size={14} /> <span className="text-xs">2FA 세션 만료: 재인증 필요</span>
                    <button onClick={() => setShow2FAModal(true)} className="text-xs underline underline-offset-2 hover:no-underline ml-1">재인증</button></>
                }
              </div>
              {/* Scroll status */}
              <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border ${scrollDone ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                {scrollDone ? <><CheckCircle2 size={13} /> 전체 열람 완료</> : <><ArrowDown size={13} /> 스크롤 {scrollPct}% ({100 - scrollPct}% 남음)</>}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-red-300 hover:text-red-600 transition-all"
              >
                <ThumbsDown size={13} /> 반려
              </button>

              {/* Approve button with tooltip */}
              <div className="relative group">
                <button
                  onClick={() => canApprove && setShowApproveModal(true)}
                  disabled={!canApprove}
                  className={`flex items-center gap-2 px-6 py-2.5 text-sm rounded-lg transition-all ${
                    canApprove
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canApprove ? <Unlock size={13} /> : <Lock size={13} />}
                  승인
                </button>

                {/* Tooltip when disabled */}
                {!canApprove && (
                  <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-2xl z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="flex items-start gap-2 mb-2">
                      <Lock size={11} className="text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-gray-200">승인 버튼이 잠겨 있습니다.</p>
                    </div>
                    <ul className="space-y-1 pl-3">
                      {missingReasons.map((r) => (
                        <li key={r} className="text-amber-300 text-xs list-disc">{r}</li>
                      ))}
                    </ul>
                    <div className="absolute bottom-[-5px] right-6 w-2.5 h-2.5 bg-gray-900 rotate-45" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {show2FAModal && (
        <TwoFAModal
          onSuccess={() => { setShow2FAModal(false); setTwoFAState("active"); setSessionTimer(1800); }}
          onClose={() => setShow2FAModal(false)}
        />
      )}
      {showApproveModal && (
        <ApproveConfirmModal
          onConfirm={() => {
            setShowApproveModal(false);
            setDone("approved");
            toast.success("고위험 문서 최종 승인 완료", {
              description: "2FA 인증 및 결재 처리가 정상적으로 완료되었습니다.",
            });
          }}
          onClose={() => setShowApproveModal(false)}
        />
      )}
      {showRejectModal && (
        <RejectModal
          onConfirm={() => { setShowRejectModal(false); setDone("rejected"); }}
          onClose={() => setShowRejectModal(false)}
        />
      )}
    </>
  );
}