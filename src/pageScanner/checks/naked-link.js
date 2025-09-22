/**
 * Check if a link contains "naked" text that matches its href attribute.
 * A naked link is when the visible text is just the URL itself.
 * 
 * Examples of naked links:
 * - <a href="https://example.com">https://example.com</a>
 * - <a href="http://www.example.com">http://www.example.com</a>
 * - <a href="https://example.com/page">https://example.com/page</a>
 * 
 * This is an accessibility issue because screen reader users hearing the URL
 * read out twice provides no additional context about the link's purpose.
 */

export default {
	id: 'naked_link',
	evaluate: ( node ) => {
		// Only check anchor elements
		if ( node.nodeName.toLowerCase() !== 'a' ) {
			return false;
		}

		// Get the href attribute
		const href = node.getAttribute( 'href' );
		if ( ! href ) {
			return false;
		}

		// Skip mailto, tel, and other special protocol links
		const specialProtocols = [ 'mailto:', 'tel:', 'sms:', 'fax:', 'javascript:', '#' ];
		if ( specialProtocols.some( protocol => href.startsWith( protocol ) ) ) {
			return false;
		}

		// Get the visible text content of the link
		let linkText = '';

		// First check for aria-label
		if ( node.hasAttribute( 'aria-label' ) ) {
			linkText = node.getAttribute( 'aria-label' );
		}
		// Then check for aria-labelledby
		else if ( node.hasAttribute( 'aria-labelledby' ) ) {
			const labelIds = node.getAttribute( 'aria-labelledby' ).split( ' ' );
			const labelTexts = labelIds.map( id => {
				const element = document.getElementById( id );
				return element ? element.textContent : '';
			} );
			linkText = labelTexts.join( ' ' );
		}
		// Otherwise use the text content
		else {
			linkText = node.textContent || '';
		}

		// Clean up the text - trim whitespace and normalize
		linkText = linkText.trim();
		
		// If there's no text, this is not a naked link issue (it's an empty link issue)
		if ( ! linkText ) {
			return false;
		}

		// Normalize both href and text for comparison
		const normalizedHref = href.trim().toLowerCase();
		const normalizedText = linkText.trim().toLowerCase();

		// Direct match check
		if ( normalizedHref === normalizedText ) {
			return true;
		}

		// Check if text matches href without protocol
		const hrefWithoutProtocol = normalizedHref.replace( /^https?:\/\//, '' );
		if ( hrefWithoutProtocol === normalizedText ) {
			return true;
		}

		// Check if text matches href without www
		const hrefWithoutWww = normalizedHref.replace( /^https?:\/\/(www\.)?/, '' );
		if ( hrefWithoutWww === normalizedText ) {
			return true;
		}

		// Check if text matches href without trailing slash
		const hrefWithoutTrailingSlash = normalizedHref.replace( /\/$/, '' );
		const textWithoutTrailingSlash = normalizedText.replace( /\/$/, '' );
		if ( hrefWithoutTrailingSlash === textWithoutTrailingSlash ) {
			return true;
		}

		// Check various combinations
		const hrefVariations = [
			normalizedHref,
			hrefWithoutProtocol,
			hrefWithoutWww,
			hrefWithoutTrailingSlash,
			hrefWithoutProtocol.replace( /\/$/, '' ),
			hrefWithoutWww.replace( /\/$/, '' ),
		];

		const textVariations = [
			normalizedText,
			normalizedText.replace( /^https?:\/\//, '' ),
			normalizedText.replace( /^https?:\/\/(www\.)?/, '' ),
			textWithoutTrailingSlash,
		];

		// Check all combinations
		for ( const hrefVar of hrefVariations ) {
			for ( const textVar of textVariations ) {
				if ( hrefVar === textVar ) {
					return true;
				}
			}
		}

		// Check if the text looks like a URL pattern (even if not exact match)
		const urlPattern = /^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/[a-z0-9-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;
		if ( urlPattern.test( normalizedText ) ) {
			// If the text looks like a URL, check if it's related to the href
			const textDomain = normalizedText.replace( /^(https?:\/\/)?(www\.)?/, '' ).split( '/' )[0];
			const hrefDomain = normalizedHref.replace( /^(https?:\/\/)?(www\.)?/, '' ).split( '/' )[0];
			
			if ( textDomain === hrefDomain ) {
				return true;
			}
		}

		return false;
	},
};