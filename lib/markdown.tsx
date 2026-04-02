import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
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
import Heading from "@/app/components/Section/Heading";
import Paragraph from "@/app/components/Section/Paragraph";
import UnorderedList from "@/app/components/Section/UnorderedList";
import ListItem from "@/app/components/Section/ListItem";
import ExternalLink from "@/app/components/Section/ExternalLink";

export const documentFrontmatterSchema = z.object({
	lastUpdatedAt: z.string(),
});

export type DocumentFrontmatter = z.infer<typeof documentFrontmatterSchema>;

export function isDOMNode(node: unknown): node is DOMNode {
	return (
		node instanceof Element ||
		node instanceof Text ||
		node instanceof Comment ||
		node instanceof ProcessingInstruction
	);
}

export function replaceWithClass(node: DOMNode) {
	if (!(node instanceof Element)) return;
	const children = domToReact(node.children.filter(isDOMNode), {
		replace: replaceWithClass,
	});
	if (node.name === "h3") return <Heading>{children}</Heading>;
	if (node.name === "p") return <Paragraph>{children}</Paragraph>;
	if (node.name === "ul") return <UnorderedList>{children}</UnorderedList>;
	if (node.name === "li") return <ListItem>{children}</ListItem>;
	if (node.name === "a" && node.attribs.href)
		return <ExternalLink href={node.attribs.href}>{children}</ExternalLink>;
}

async function toHtml(content: string): Promise<string> {
	const processed = await remark().use(html).process(content);
	return processed.toString();
}

export async function parseMarkdownFile(filename: string): Promise<{
	frontmatter: DocumentFrontmatter;
	contentHtml: string;
}> {
	const filePath = path.join(process.cwd(), "content", filename);
	const fileContent = fs.readFileSync(filePath, "utf-8");
	const { data, content } = matter(fileContent);
	const frontmatter = documentFrontmatterSchema.parse(data);
	return { frontmatter, contentHtml: await toHtml(content) };
}

export async function parseMarkdownContent(filename: string): Promise<string> {
	const filePath = path.join(process.cwd(), "content", filename);
	const fileContent = fs.readFileSync(filePath, "utf-8");
	const { content } = matter(fileContent);
	return toHtml(content);
}
