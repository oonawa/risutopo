export type MovieInputValues =
	| {
			mobile: { shareLink: string };
			browser?: never;
	  }
	| {
			browser: { title: string; url: string };
			mobile?: never;
	  };
