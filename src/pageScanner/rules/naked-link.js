export default {
	id: 'naked_link',
	selector: 'a[href]',
	excludeHidden: true,
	tags: [ 'wcag2a', 'wcag2.4.4' ],
	metadata: {
		description: 'Ensures links do not use raw URLs as their text content',
		help: 'Links should use descriptive text instead of raw URLs',
		helpUrl: 'https://a11ychecker.com/help/naked-link',
	},
	any: [],
	all: [ 'link-is-naked' ],
	none: [],
};