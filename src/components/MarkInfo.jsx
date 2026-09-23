import { describeMark } from "../utils/helpers";

// Shows "Point" / "Area" tag with its position or size
export default function MarkInfo({ label }) {
  const { type, text } = describeMark(label);
  return (
    <span className="muted small">
      <span className={`type-tag ${type === "Area" ? "area" : ""}`}>{type}</span> {text}
    </span>
  );
}
