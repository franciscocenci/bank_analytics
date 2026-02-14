import { Outlet } from "react-router-dom";
import "./ConfiguracoesLayout.css";

export default function ConfiguracoesLayout() {
  return (
    <div className="config-shell">
      <div className="config-container config-container--single">
        <section className="config-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
