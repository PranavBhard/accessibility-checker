import axe from 'axe-core';

beforeAll( async () => {
	const ruleModule = await import( '../../../src/pageScanner/rules/link-naked.js' );
	const checkModule = await import( '../../../src/pageScanner/checks/link-is-naked.js' );

	const linkNakedRule = ruleModule.default;
	const linkIsNakedCheck = checkModule.default;

	axe.configure( {
		rules: [ linkNakedRule ],
		checks: [ linkIsNakedCheck ],
	} );
} );

beforeEach( () => {
	document.body.innerHTML = '';
} );

describe( 'link-naked rule', () => {
	it( 'should flag links with URLs as text content', async () => {
		document.body.innerHTML = `
			<a href="https://example.com">https://example.com</a>
			<a href="http://www.example.com">http://www.example.com</a>
			<a href="https://example.com/">https://example.com/</a>
		`;

		const results = await axe.run( document.body, {
			runOnly: [ 'link_naked' ],
		} );

		expect( results.violations ).toHaveLength( 1 );
		expect( results.violations[ 0 ].id ).toBe( 'link_naked' );
		expect( results.violations[ 0 ].nodes ).toHaveLength( 3 );
	} );

	it( 'should flag links with URLs without protocol', async () => {
		document.body.innerHTML = `
			<a href="https://example.com">example.com</a>
			<a href="https://www.example.com">www.example.com</a>
			<a href="http://example.com">example.com</a>
		`;

		const results = await axe.run( document.body, {
			runOnly: [ 'link_naked' ],
		} );

		expect( results.violations ).toHaveLength( 1 );
		expect( results.violations[ 0 ].id ).toBe( 'link_naked' );
		expect( results.violations[ 0 ].nodes ).toHaveLength( 3 );
	} );

	it( 'should flag mailto links with email as text', async () => {
		document.body.innerHTML = `
			<a href="mailto:test@example.com">test@example.com</a>
			<a href="mailto:test@example.com">mailto:test@example.com</a>
		`;

		const results = await axe.run( document.body, {
			runOnly: [ 'link_naked' ],
		} );

		expect( results.violations ).toHaveLength( 1 );
		expect( results.violations[ 0 ].id ).toBe( 'link_naked' );
		expect( results.violations[ 0 ].nodes ).toHaveLength( 2 );
	} );

	it( 'should flag tel links with phone number as text', async () => {
		document.body.innerHTML = `
			<a href="tel:+1234567890">+1234567890</a>
			<a href="tel:+1234567890">tel:+1234567890</a>
		`;

		const results = await axe.run( document.body, {
			runOnly: [ 'link_naked' ],
		} );

		expect( results.violations ).toHaveLength( 1 );
		expect( results.violations[ 0 ].id ).toBe( 'link_naked' );
		expect( results.violations[ 0 ].nodes ).toHaveLength( 2 );
	} );

	it( 'should not flag links with descriptive text', async () => {
		document.body.innerHTML = `
			<a href="https://example.com">Visit our website</a>
			<a href="https://example.com">Example Company</a>
			<a href="mailto:test@example.com">Contact us</a>
			<a href="tel:+1234567890">Call us</a>
			<a href="https://example.com/page">Learn more about our services</a>
		`;

		const results = await axe.run( document.body, {
			runOnly: [ 'link_naked' ],
		} );

		expect( results.violations ).toHaveLength( 0 );
	} );

	it( 'should handle relative URLs correctly', async () => {
		document.body.innerHTML = `
			<a href="/about">/about</a>
			<a href="./contact">./contact</a>
			<a href="../home">../home</a>
		`;

		const results = await axe.run( document.body, {
			runOnly: [ 'link_naked' ],
		} );

		expect( results.violations ).toHaveLength( 1 );
		expect( results.violations[ 0 ].id ).toBe( 'link_naked' );
		expect( results.violations[ 0 ].nodes ).toHaveLength( 3 );
	} );

	it( 'should handle URL-encoded characters', async () => {
		document.body.innerHTML = `
			<a href="https://example.com/page%20with%20spaces">https://example.com/page with spaces</a>
			<a href="https://example.com/page with spaces">https://example.com/page%20with%20spaces</a>
		`;

		const results = await axe.run( document.body, {
			runOnly: [ 'link_naked' ],
		} );

		expect( results.violations ).toHaveLength( 1 );
		expect( results.violations[ 0 ].id ).toBe( 'link_naked' );
		expect( results.violations[ 0 ].nodes ).toHaveLength( 2 );
	} );

	it( 'should handle protocol variations', async () => {
		document.body.innerHTML = `
			<a href="https://example.com">http://example.com</a>
			<a href="http://example.com">https://example.com</a>
		`;

		const results = await axe.run( document.body, {
			runOnly: [ 'link_naked' ],
		} );

		expect( results.violations ).toHaveLength( 1 );
		expect( results.violations[ 0 ].id ).toBe( 'link_naked' );
		expect( results.violations[ 0 ].nodes ).toHaveLength( 2 );
	} );

	it( 'should handle trailing slash variations', async () => {
		document.body.innerHTML = `
			<a href="https://example.com/">https://example.com</a>
			<a href="https://example.com">https://example.com/</a>
		`;

		const results = await axe.run( document.body, {
			runOnly: [ 'link_naked' ],
		} );

		expect( results.violations ).toHaveLength( 1 );
		expect( results.violations[ 0 ].id ).toBe( 'link_naked' );
		expect( results.violations[ 0 ].nodes ).toHaveLength( 2 );
	} );

	it( 'should not flag empty links', async () => {
		document.body.innerHTML = `
			<a href="https://example.com"></a>
			<a href="https://example.com"> </a>
		`;

		const results = await axe.run( document.body, {
			runOnly: [ 'link_naked' ],
		} );

		expect( results.violations ).toHaveLength( 0 );
	} );

	it( 'should not flag links without href', async () => {
		document.body.innerHTML = `
			<a>https://example.com</a>
		`;

		const results = await axe.run( document.body, {
			runOnly: [ 'link_naked' ],
		} );

		expect( results.violations ).toHaveLength( 0 );
	} );
} );