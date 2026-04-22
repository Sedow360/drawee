import { useEffect, useRef } from 'react';
import socket from '../lib/socket';
import { type Stroke } from '../types';

export function useCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  strokesRef: React.MutableRefObject<Stroke[]>,
  drawerOpenRef: React.MutableRefObject<boolean>,
  toolRef: React.MutableRefObject<'draw' | 'erase' | 'null'>,
  colorRef: React.MutableRefObject<string>,
  widthRef: React.MutableRefObject<number>,
) {
  const panRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const zoomRef = useRef(1);
  const activePointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const currentStroke = useRef<Stroke | null>(null);
  const rafRef = useRef<number>(0);

  function screenToWorld(sx: number, sy: number): [number, number] {
    const pan = panRef.current;
    const zoom = zoomRef.current;
    return [(sx - pan.x) / zoom, (sy - pan.y) / zoom];
  }

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.isDeleted || stroke.points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i][0], stroke.points[i][1]);
    }
    ctx.stroke();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
    }
    resize();
    window.addEventListener('resize', resize);

    function loop() {
      const pan = panRef.current;
      const zoom = zoomRef.current;
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.save();
      ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, dpr * pan.x, dpr * pan.y);
      for (const stroke of strokesRef.current) drawStroke(ctx, stroke);
      if (currentStroke.current) drawStroke(ctx, currentStroke.current);
      ctx.restore();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    function onPointerDown(e: PointerEvent) {
      // if (drawerOpenRef.current) return;
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePointers.current.size >= 2) {
        currentStroke.current = null;
        return;
      }
      canvas!.setPointerCapture(e.pointerId);
      if (toolRef.current === 'draw') {
        const [wx, wy] = screenToWorld(e.clientX, e.clientY);
        currentStroke.current = {
          id: crypto.randomUUID(),
          points: [[wx, wy]],
          color: colorRef.current,
          width: widthRef.current,
          isDeleted: false,
        };
      }
    }

    function onPointerMove(e: PointerEvent) {
      activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (toolRef.current === 'draw' && currentStroke.current) {
        const [wx, wy] = screenToWorld(e.clientX, e.clientY);
        currentStroke.current.points.push([wx, wy]);
      }

      if (toolRef.current === 'erase') {
        const [wx, wy] = screenToWorld(e.clientX, e.clientY);
        const radius = widthRef.current / zoomRef.current;
        for (const stroke of strokesRef.current) {
          if (stroke.isDeleted) continue;
          const hit = stroke.points.some(
            ([px, py]) => Math.hypot(px - wx, py - wy) <= radius
          );
          if (hit) {
            stroke.isDeleted = true;
            socket.emit('delete_stroke', { strokeId: stroke.id });
          }
        }
      }
    }

    function onPointerUp(e: PointerEvent) {
      activePointers.current.delete(e.pointerId);
      if (toolRef.current === 'draw' && currentStroke.current) {
        const stroke = currentStroke.current;
        strokesRef.current.push(stroke);
        socket.emit('send_stroke', stroke);
        currentStroke.current = null;
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (e.ctrlKey) {
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const prevZoom = zoomRef.current;
        const newZoom = Math.min(20, Math.max(0.05, prevZoom * zoomFactor));
        const wx = (e.clientX - panRef.current.x) / prevZoom;
        const wy = (e.clientY - panRef.current.y) / prevZoom;
        panRef.current = {
          x: e.clientX - wx * newZoom,
          y: e.clientY - wy * newZoom,
        };
        zoomRef.current = newZoom;
      } else {
        panRef.current = {
          x: panRef.current.x - e.deltaX,
          y: panRef.current.y - e.deltaY,
        };
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current!);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, []);
}