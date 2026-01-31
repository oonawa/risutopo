"use client";

import { useState, useCallback, useEffect, useRef, forwardRef } from "react";
import type { FormEventHandler, TextareaHTMLAttributes } from "react";

type AppTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	autoSize?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
	function Textarea({ autoSize = true, className, onInput, ...props }, ref) {
		const innerRef = useRef<HTMLTextAreaElement | null>(null);

		// ブラウザ検出を初期化時に実行
		const [shouldAutoResize] = useState(() => {
			if (typeof window === "undefined") return false;

			const ua = navigator.userAgent;
			// Firefox と Safari では field-sizing: content が未対応のため
			// 手動でリサイズが必要
			const isFirefox = /Firefox/i.test(ua);
			const isWebKit =
				/AppleWebKit/i.test(ua) && !/Chrome|Chromium|Edg|OPR|Brave/i.test(ua);

			return isFirefox || isWebKit;
		});

		const setRef = useCallback(
			(el: HTMLTextAreaElement | null) => {
				innerRef.current = el;

				if (typeof ref === "function") {
					ref(el);
				} else if (ref && "current" in ref) {
					ref.current = el;
				}
			},
			[ref],
		);

		const resize = useCallback((el: HTMLTextAreaElement | null) => {
			if (!el) return;
			el.style.height = "auto";
			el.style.height = `${el.scrollHeight}px`;
		}, []);

		const controlledValue = props.value;

		useEffect(() => {
			if (autoSize && shouldAutoResize && innerRef.current) {
				void controlledValue;
				resize(innerRef.current);
			}
		}, [autoSize, shouldAutoResize, resize, controlledValue]);

		const handleInput: FormEventHandler<HTMLTextAreaElement> = (e) => {
			if (autoSize && shouldAutoResize) {
				resize(e.currentTarget);
			}
			onInput?.(e);
		};

		return (
			<textarea
				ref={setRef}
				onInput={handleInput}
				className={`${
					shouldAutoResize
						? "resize-none overflow-hidden"
						: "resize-none outline-none p-2 border-2 box-border transition-colors duration-300 ease-in-out"
				} ${className ?? ""}`}
				{...props}
			/>
		);
	},
);
