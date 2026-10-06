import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface IndicatorStyle {
    left: number;
    width: number;
    opacity: number;
}

const HIDDEN: IndicatorStyle = { left: 0, width: 0, opacity: 0 };

/**
 * Calcula la posición del indicador bajo el link activo, relativa al contenedor.
 * - `containerRef`: se asigna al <nav> (origen de coordenadas del indicador).
 * - `registerItem(key)`: ref callback para cada link.
 */
export function useNavIndicator(activeKey: string | undefined) {
    const containerRef = useRef<HTMLElement>(null);
    const itemRefs = useRef(new Map<string, HTMLElement>());
    const [style, setStyle] = useState<IndicatorStyle>(HIDDEN);

    const registerItem = useCallback(
        (key: string) => (el: HTMLElement | null) => {
            if (el) itemRefs.current.set(key, el);
            else itemRefs.current.delete(key);
        },
        [],
    );

    const update = useCallback(() => {
        const container = containerRef.current;
        const item = activeKey ? itemRefs.current.get(activeKey) : undefined;

        if (!container || !item) {
            setStyle((prev) => (prev.opacity === 0 ? prev : { ...prev, opacity: 0 }));
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const next = {
            left: itemRect.left - containerRect.left,
            width: itemRect.width,
            opacity: 1,
        };

        // Evita renders innecesarios si nada cambió
        setStyle((prev) =>
            prev.left === next.left && prev.width === next.width && prev.opacity === 1
                ? prev
                : next,
        );
    }, [activeKey]);

    // Posiciona antes del paint cuando cambia la ruta activa
    useLayoutEffect(update, [update]);

    // Reposiciona si cambia el tamaño del nav (resize, cambio de breakpoint, fuentes...)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(update);
        observer.observe(container);
        return () => observer.disconnect();
    }, [update]);

    return { containerRef, registerItem, style };
}