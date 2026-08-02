"use client";

import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from "react";

export default function PrimeMotion({
  children,
  delay = 0,
  duration = 520,
  distance = 18,
  once = true,
  threshold = 0.12,
  className = "",
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);

          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -4% 0px",
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [once, threshold]);

  return (
    <Tag
      ref={ref}
      className={`prime-motion ${visible ? "prime-motion-visible" : ""} ${className}`}
      style={{
        "--prime-motion-delay": `${delay}ms`,
        "--prime-motion-duration": `${duration}ms`,
        "--prime-motion-distance": `${distance}px`,
      }}
    >
      {children}

      <style jsx>{`
        .prime-motion {
          opacity: 0;
          transform: translate3d(0, var(--prime-motion-distance), 0);
          transition:
            opacity var(--prime-motion-duration)
              cubic-bezier(0.22, 1, 0.36, 1)
              var(--prime-motion-delay),
            transform var(--prime-motion-duration)
              cubic-bezier(0.22, 1, 0.36, 1)
              var(--prime-motion-delay);
          will-change: opacity, transform;
        }

        .prime-motion-visible {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }

        @media (prefers-reduced-motion: reduce) {
          .prime-motion,
          .prime-motion-visible {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </Tag>
  );
}

export function PrimeMotionGroup({
  children,
  stagger = 80,
  startDelay = 0,
  duration = 520,
  distance = 18,
  once = true,
  threshold = 0.12,
  className = "",
  as: Tag = "div",
}) {
  return (
    <Tag className={className}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        return (
          <PrimeMotion
            key={child.key ?? index}
            delay={startDelay + index * stagger}
            duration={duration}
            distance={distance}
            once={once}
            threshold={threshold}
          >
            {cloneElement(child)}
          </PrimeMotion>
        );
      })}
    </Tag>
  );
}

export function PrimePress({
  children,
  className = "",
  as: Tag = "div",
  disabled = false,
  ...props
}) {
  return (
    <Tag
      className={`prime-press ${disabled ? "prime-press-disabled" : ""} ${className}`}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {children}

      <style jsx>{`
        .prime-press {
          transition:
            transform 160ms ease,
            filter 160ms ease,
            opacity 160ms ease;
          will-change: transform;
        }

        .prime-press:not(.prime-press-disabled):active {
          transform: scale(0.985);
        }

        .prime-press:not(.prime-press-disabled):hover {
          filter: brightness(1.035);
        }

        .prime-press-disabled {
          opacity: 0.42;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .prime-press,
          .prime-press:active,
          .prime-press:hover {
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </Tag>
  );
}
