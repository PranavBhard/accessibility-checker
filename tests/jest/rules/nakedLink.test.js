import axe from 'axe-core';

beforeAll( async () => {
	// Dynamically import the custom rule
	const nakedLinkRuleModule = await import( '../../../src/pageScanner/rules/naked-link.js' );
	const linkIsNakedCheckModule = await import( '../../../src/pageScanner/checks/link-is-naked.js' );
	const nakedLinkRule = nakedLinkRuleModule.default;
	const linkIsNakedCheck = linkIsNakedCheckModule.default;

	// Configure axe with the custom rule
	axe.configure( {
		rules: [ nakedLinkRule ],
		checks: [ linkIsNakedCheck ],
	} );
} );

beforeEach( () => {
	document.body.innerHTML = '';
} );

describe( 'Naked Link Validation', () => {
	const testCases = [
		// Passing cases (should NOT trigger warning)
		{
			name: 'should pass for link with descriptive text',
			html: '<a href="https://example.com">Visit our website</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for link with descriptive text that contains domain',
			html: '<a href="https://example.com">Example.com homepage</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for link with aria-label',
			html: '<a href="https://example.com" aria-label="Visit our homepage">https://example.com</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for anchor links',
			html: '<a href="#section">Jump to section</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for anchor links with URL-like text',
			html: '<a href="#contact">https://contact-us</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for empty href',
			html: '<a href="">Click here</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for href with only hash',
			html: '<a href="#">Top</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for link without href',
			html: '<a>https://example.com</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for link with aria-labelledby',
			html: '<span id="link-label">Visit our site</span><a href="https://example.com" aria-labelledby="link-label">https://example.com</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for link with text that is not a URL',
			html: '<a href="https://example.com">Learn more about our products</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for relative links with descriptive text',
			html: '<a href="/about">About Us</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for email links with descriptive text',
			html: '<a href="mailto:contact@example.com">Contact us via email</a>',
			shouldPass: true,
		},
		{
			name: 'should pass for phone links with descriptive text',
			html: '<a href="tel:+1234567890">Call us</a>',
			shouldPass: true,
		},
		{
			name: 'should pass when link text is empty',
			html: '<a href="https://example.com"></a>',
			shouldPass: true,
		},
		{
			name: 'should pass when href and text are completely different',
			html: '<a href="https://example.com">https://different-site.com</a>',
			shouldPass: true,
		},

		// Failing cases (should trigger warning)
		{
			name: 'should fail for link with URL as text (https)',
			html: '<a href="https://example.com">https://example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for link with URL as text (http)',
			html: '<a href="http://example.com">http://example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for link with URL as text without protocol in text',
			html: '<a href="https://example.com">example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for link with www URL as text',
			html: '<a href="https://www.example.com">www.example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for link with URL including path',
			html: '<a href="https://example.com/about">https://example.com/about</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for link with URL including path without protocol in text',
			html: '<a href="https://example.com/about">example.com/about</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for link with URL with trailing slash',
			html: '<a href="https://example.com/">https://example.com/</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for link where text is URL without trailing slash',
			html: '<a href="https://example.com/">https://example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for FTP links',
			html: '<a href="ftp://files.example.com">ftp://files.example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for mailto links with email as text',
			html: '<a href="mailto:contact@example.com">contact@example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for mailto links with full mailto URL as text',
			html: '<a href="mailto:contact@example.com">mailto:contact@example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for tel links with phone number as text',
			html: '<a href="tel:+1234567890">+1234567890</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for tel links with full tel URL as text',
			html: '<a href="tel:+1234567890">tel:+1234567890</a>',
			shouldPass: false,
		},
		{
			name: 'should fail when href has www but text doesn\'t',
			html: '<a href="https://www.example.com">example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail when text has www but href doesn\'t',
			html: '<a href="https://example.com">www.example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for subdomain URLs',
			html: '<a href="https://blog.example.com">blog.example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for URLs with query parameters',
			html: '<a href="https://example.com?ref=home">example.com?ref=home</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for URLs with fragments',
			html: '<a href="https://example.com#section">example.com#section</a>',
			shouldPass: false,
		},
		{
			name: 'should fail when text looks like domain',
			html: '<a href="/home">example.com</a>',
			shouldPass: false,
		},
		{
			name: 'should fail for multiple naked links',
			html: '<a href="https://example.com">https://example.com</a> and <a href="https://test.com">test.com</a>',
			shouldPass: false,
		},
	];

	testCases.forEach( ( testCase ) => {
		test( testCase.name, async () => {
			document.body.innerHTML = testCase.html;

			const results = await axe.run( document.body, {
				runOnly: [ 'naked_link' ],
			} );

			if ( testCase.shouldPass ) {
				expect( results.violations.length ).toBe( 0 );
			} else {
				expect( results.violations.length ).toBeGreaterThan( 0 );
			}
		} );
	} );
} );