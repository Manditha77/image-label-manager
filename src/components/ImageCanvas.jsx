import { useRef, useState } from "react";
import { clamp } from "../utils/helpers";

const COLORS = {
  draft: "#f59e0b", // orange = not saved yet
  active: "#2563eb", // blue = saved
  pending: "#6b7280", // grey = delete requested
  highlight: "#dc2626", // red = highlighted (e.g. in approval screen)
};

const MIN_AREA_PX = 10; // drag at least 10px on screen to create an area (less = a point)

/**
 * Shows an image with numbered arrows on top (SVG overlay).
 * editable:
 *   - click          -> add a point
 *   - click & drag   -> select an area (rectangle)
 *   - drag an orange number circle -> move the number
 * Positions are stored as 0..1 fractions, so they work at any screen size.
 */
export default function ImageCanvas({ image, labels, editable = false, onAdd, onMove, highlightIds }) {
  const svgRef = useRef(null);
  const moveIdRef = useRef(null); // id of the number circle being moved
  const drawRef = useRef(null); // start of the area being drawn
  const [drawRect, setDrawRect] = useState(null); // preview rectangle while drawing

  const W = image.width;
  const H = image.height;
  const size = Math.max(W, H);
  const r = size * 0.02; // circle radius
  const stroke = size * 0.004;

  // Mouse position -> 0..1 position on the image
  function toFraction(e) {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
      y: clamp((e.clientY - rect.top) / rect.height, 0, 1),
    };
  }

  function rectFrom(a, b) {
    return {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(b.x - a.x),
      h: Math.abs(b.y - a.y),
    };
  }

  // Start drawing (on the image background)
  function handlePointerDown(e) {
    if (!editable || !onAdd || e.button !== 0) return;
    const start = toFraction(e);
    drawRef.current = { start, clientX: e.clientX, clientY: e.clientY };
    setDrawRect({ ...start, w: 0, h: 0 });
    svgRef.current.setPointerCapture(e.pointerId);
  }

  // Start moving a number circle
  function startMove(e, label) {
    if (!editable || label.status !== "draft") return;
    e.stopPropagation(); // don't start drawing
    moveIdRef.current = label.id;
    svgRef.current.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (moveIdRef.current && onMove) {
      const { x, y } = toFraction(e);
      onMove(moveIdRef.current, clamp(x, 0.02, 0.98), clamp(y, 0.02, 0.98));
      return;
    }
    if (drawRef.current) {
      setDrawRect(rectFrom(drawRef.current.start, toFraction(e)));
    }
  }

  function handlePointerUp(e) {
    if (moveIdRef.current) {
      moveIdRef.current = null;
      return;
    }
    if (!drawRef.current) return;

    const { start, clientX, clientY } = drawRef.current;
    drawRef.current = null;
    setDrawRect(null);

    const draggedW = Math.abs(e.clientX - clientX);
    const draggedH = Math.abs(e.clientY - clientY);
    if (draggedW >= MIN_AREA_PX && draggedH >= MIN_AREA_PX) {
      const area = rectFrom(start, toFraction(e));
      onAdd(area.x + area.w / 2, area.y + area.h / 2, area); // area: arrow points to its centre/edge
    } else {
      onAdd(start.x, start.y, null); // simple click: a point
    }
  }

  function cancelDraw() {
    moveIdRef.current = null;
    drawRef.current = null;
    setDrawRect(null);
  }

  return (
    <div className="canvas-wrap">
      <img src={image.dataUrl} alt={image.name} draggable={false} />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={editable ? "canvas-svg editable" : "canvas-svg"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={cancelDraw}
      >
        {/* Draw all areas first, so arrows and numbers are always on top */}
        {labels.map((label) => {
          if (!label.area) return null;
          const color = colorFor(label, highlightIds);
          return (
            <rect
              key={`area-${label.id}`}
              x={label.area.x * W}
              y={label.area.y * H}
              width={label.area.w * W}
              height={label.area.h * H}
              fill={color}
              fillOpacity={0.15}
              stroke={color}
              strokeWidth={stroke}
              strokeDasharray={`${stroke * 3} ${stroke * 2}`}
              pointerEvents="none"
            />
          );
        })}

        {labels.map((label) => (
          <Marker
            key={label.id}
            label={label}
            W={W}
            H={H}
            r={r}
            stroke={stroke}
            color={colorFor(label, highlightIds)}
            draggable={editable && label.status === "draft"}
            onPointerDown={(e) => startMove(e, label)}
          />
        ))}

        {/* Preview while drawing an area */}
        {drawRect && drawRect.w > 0 && drawRect.h > 0 && (
          <rect
            x={drawRect.x * W}
            y={drawRect.y * H}
            width={drawRect.w * W}
            height={drawRect.h * H}
            fill={COLORS.draft}
            fillOpacity={0.2}
            stroke={COLORS.draft}
            strokeWidth={stroke}
            strokeDasharray={`${stroke * 3} ${stroke * 2}`}
            pointerEvents="none"
          />
        )}
      </svg>
    </div>
  );
}

function colorFor(label, highlightIds) {
  if (highlightIds?.has(label.id)) return COLORS.highlight;
  return COLORS[label.status] || COLORS.active;
}

// Where the arrow should point: for an area, the nearest point on its border; otherwise the point.
function arrowTarget(label, W, H) {
  if (!label.area) return { px: label.x * W, py: label.y * H };
  const a = label.area;
  const left = a.x * W;
  const top = a.y * H;
  const right = (a.x + a.w) * W;
  const bottom = (a.y + a.h) * H;
  const cx = label.lx * W;
  const cy = label.ly * H;
  const inside = cx >= left && cx <= right && cy >= top && cy <= bottom;
  if (inside) return { px: (left + right) / 2, py: (top + bottom) / 2 };
  return { px: clamp(cx, left, right), py: clamp(cy, top, bottom) };
}

function Marker({ label, W, H, r, stroke, color, draggable, onPointerDown }) {
  const { px, py } = arrowTarget(label, W, H);
  const cx = label.lx * W;
  const cy = label.ly * H;

  const dx = px - cx;
  const dy = py - cy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len; // unit direction from circle to target
  const uy = dy / len;
  const head = r * 0.9; // arrow head length
  const showArrow = len > r + head;

  // Line from the edge of the circle to the base of the arrow head
  const sx = cx + ux * r;
  const sy = cy + uy * r;
  const bx = px - ux * head;
  const by = py - uy * head;
  const perpX = -uy * head * 0.55;
  const perpY = ux * head * 0.55;
  const headPoints = `${px},${py} ${bx + perpX},${by + perpY} ${bx - perpX},${by - perpY}`;

  return (
    <g className="marker">
      {showArrow && (
        <>
          <line x1={sx} y1={sy} x2={bx} y2={by} stroke="#fff" strokeWidth={stroke * 2.5} strokeLinecap="round" />
          <line x1={sx} y1={sy} x2={bx} y2={by} stroke={color} strokeWidth={stroke} strokeLinecap="round" />
          <polygon points={headPoints} fill={color} stroke="#fff" strokeWidth={stroke * 0.5} />
        </>
      )}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        stroke="#fff"
        strokeWidth={stroke}
        className={draggable ? "draggable" : ""}
        onPointerDown={onPointerDown}
      />
      <text
        x={cx}
        y={cy}
        fill="#fff"
        fontSize={r * 1.05}
        fontWeight="700"
        textAnchor="middle"
        dominantBaseline="central"
        pointerEvents="none"
      >
        {label.number}
      </text>
    </g>
  );
}
