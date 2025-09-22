/**
 * Rule to check if links appear as naked URLs.
 * A naked link is when the link text matches the href URL.
 * Based on WCAG 2.4.4 Link Purpose (In Context) (Level A)
 */

export default {
	id: 'link_naked',
	selector: 'a[href]',
	excludeHidden: true,
	any: [],
	all: [],
	none: [ 'link_is_naked' ],
	tags: [ 'wcag2a', 'wcag244', 'cat.name-role-value' ],
	metadata: {
		description: 'Ensures links do not display raw URLs as their text content',
		help: 'Links should have descriptive text instead of displaying the raw URL',
		helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
	},
};