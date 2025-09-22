/**
 * Rule to detect "naked links" - links where the visible text is just the URL itself.
 * 
 * This is an accessibility issue because:
 * 1. Screen readers will read the URL twice (once as link text, once as destination)
 * 2. URLs often don't provide meaningful context about the link's purpose
 * 3. Long URLs can be difficult to understand when read aloud
 * 
 * Good example: <a href="https://example.com">Visit our homepage</a>
 * Bad example: <a href="https://example.com">https://example.com</a>
 */

export default {
	id: 'naked_link',
	enabled: true,
	selector: 'a[href]',
	excludeHidden: false,
	tags: [
		'cat.semantics',
		'wcag2a',
		'wcag244',
		'best-practices',
	],
	metadata: {
		description: 'Ensures links have descriptive text rather than raw URLs',
		help: 'Links should have meaningful text that describes their destination, not just the URL',
		helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
	},
	all: [],
	any: [],
	none: [ 'naked_link' ],
};