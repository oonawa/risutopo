"use client";

import Form from "@/components/Form";

export default function MobileFormTextarea() {
	return (
		<Form
			className="min-h-[calc(4lh+(calc(var(--spacing)*4)))] placeholder-shown:text-ellipsis placeholder-shown:overflow-hidden wrap-break-word"
			name="movie-share-link"
			placeholder="「 ジュラシック・パーク 」 をNetflix で今 す ぐチ ェ ッ クhttps://www.netflix.com/jp/title/60002360?s=i&trkid=258593161&vlang=ja&trg=more"
		/>
	);
}
