import { useRef, useState } from "preact/hooks";

export interface ToastState {
  message: string;
  visible: boolean;
  show: (message: string) => void;
}

export function useToast(): ToastState {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const show = (msg: string) => {
    setMessage(msg);
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), 1800);
  };
  return { message, visible, show };
}

export function Toast({ state }: { state: ToastState }) {
  return (
    <div class={`toast${state.visible ? " show" : ""}`} role="status" aria-live="polite">
      {state.message}
    </div>
  );
}
