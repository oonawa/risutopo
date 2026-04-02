import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import parse, {
	Comment,
	Element,
	ProcessingInstruction,
	Text,
	type DOMNode,
	domToReact,
} from "html-react-parser";
import { remark } from "remark";
import html from "remark-html";
import { z } from "zod";
import Section from "../components/Section";

const frontmatterSchema = z.object({
	lastUpdatedAt: z.string(),
});

type Frontmatter = z.infer<typeof frontmatterSchema>;

function isDOMNode(node: unknown): node is DOMNode {
	return (
		node instanceof Element ||
		node instanceof Text ||
		node instanceof Comment ||
		node instanceof ProcessingInstruction
	);
}

function replaceWithClass(node: DOMNode) {
	if (!(node instanceof Element)) return;
	const children = domToReact(node.children.filter(isDOMNode), {
		replace: replaceWithClass,
	});
	if (node.name === "h2")
		return <h2 className="text-xl mt-10 font-bold text-foreground-dark-1">{children}</h2>;
	if (node.name === "p") return <p className="not-first:mt-4">{children}</p>;
	if (node.name === "ul") return <ul className="pl-4 my-4">{children}</ul>;
	if (node.name === "li") return <li className="list-disc">{children}</li>;
	if (node.name === "a" && node.attribs.href)
		return <a target="_blank" href={node.attribs.href} className="">{children}</a>;
}

async function getPrivacyPolicy(): Promise<{
	frontmatter: Frontmatter;
	contentHtml: string;
}> {
	const filePath = path.join(process.cwd(), "content/privacy.md");
	const fileContent = fs.readFileSync(filePath, "utf-8");
	const { data, content } = matter(fileContent);
	const frontmatter = frontmatterSchema.parse(data);
	const processed = await remark().use(html).process(content);
	return { frontmatter, contentHtml: processed.toString() };
}

export default async function PrivacyPage() {
	const { frontmatter, contentHtml } = await getPrivacyPolicy();

	return (
		<Section>
			<h1 className="text-5xl sm:text-6xl font-title text-foreground-dark-1">
				Privacy Policy
			</h1>
			<p className="mt-4 text-sm text-foreground-dark-3">
				<span>最終改訂日: {frontmatter.lastUpdatedAt}</span>
			</p>
			<div className="mt-6">
				{parse(contentHtml, { replace: replaceWithClass })}
			</div>
		</Section>
	);
}
