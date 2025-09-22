/**
 * Check if a link displays a raw URL as its text content.
 * 
 * This check evaluates whether a link element's visible text matches its href URL.
 * Common variations are considered:
 * - With or without protocol (http://, https://)
 * - With or without www prefix
 * - With or without trailing slash
 * - URL encoded characters
 * 
 * @see https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html
 */

export default {
	id: 'link_is_naked',
	evaluate( node ) {
		// Get the href attribute
		const href = node.getAttribute( 'href' );
		if ( ! href ) {
			return false;
		}

		// Get the visible text content of the link
		const linkText = node.textContent.trim();
		if ( ! linkText ) {
			return false;
		}

		// Normalize the href for comparison
		let normalizedHref = href.trim();
		
		// For relative URLs, we should check them as-is first
		// Don't convert to absolute URL for comparison

		// Normalize the link text for comparison
		let normalizedText = linkText.trim();

		// Create variations of the URL to check against
		const urlVariations = [];

		// Add the original href
		urlVariations.push( normalizedHref );

		// Remove protocol variations
		if ( normalizedHref.match( /^https?:\/\// ) ) {
			// Without protocol
			urlVariations.push( normalizedHref.replace( /^https?:\/\//, '' ) );
			
			// With different protocol
			if ( normalizedHref.startsWith( 'http://' ) ) {
				urlVariations.push( normalizedHref.replace( /^http:/, 'https:' ) );
			} else if ( normalizedHref.startsWith( 'https://' ) ) {
				urlVariations.push( normalizedHref.replace( /^https:/, 'http:' ) );
			}
		}

		// Add/remove www variations
		urlVariations.forEach( ( url ) => {
			if ( url.match( /^(https?:\/\/)?(www\.)/ ) ) {
				// Without www
				urlVariations.push( url.replace( /^(https?:\/\/)?(www\.)/, '$1' ) );
			} else if ( url.match( /^https?:\/\// ) ) {
				// With www
				urlVariations.push( url.replace( /^(https?:\/\/)/, '$1www.' ) );
			} else if ( ! url.match( /^https?:\/\// ) && url.match( /^www\./ ) ) {
				// Remove www from non-protocol URLs
				urlVariations.push( url.replace( /^www\./, '' ) );
			} else if ( ! url.match( /^https?:\/\// ) && ! url.match( /^www\./ ) ) {
				// Add www to non-protocol URLs
				urlVariations.push( 'www.' + url );
			}
		} );

		// Add/remove trailing slash variations
		const trailingSlashVariations = [];
		urlVariations.forEach( ( url ) => {
			trailingSlashVariations.push( url );
			if ( url.endsWith( '/' ) && url !== '/' ) {
				trailingSlashVariations.push( url.slice( 0, -1 ) );
			} else if ( ! url.endsWith( '/' ) && ! url.includes( '?' ) && ! url.includes( '#' ) ) {
				// Only add trailing slash if there's no query string or hash
				trailingSlashVariations.push( url + '/' );
			}
		} );

		// Decode URL encoded characters for comparison
		const decodedVariations = [];
		trailingSlashVariations.forEach( ( url ) => {
			decodedVariations.push( url );
			try {
				const decoded = decodeURIComponent( url );
				if ( decoded !== url ) {
					decodedVariations.push( decoded );
				}
			} catch ( e ) {
				// If decoding fails, skip
			}
		} );

		// First check if text matches the href directly (important for relative URLs)
		if ( normalizedText === normalizedHref ) {
			return true; // This is a naked link
		}

		// Check if the link text matches any URL variation
		const uniqueVariations = [ ...new Set( decodedVariations ) ];
		for ( const variation of uniqueVariations ) {
			if ( normalizedText === variation ) {
				return true; // This is a naked link
			}
		}

		// Also check for encoded text
		try {
			const decodedText = decodeURIComponent( normalizedText );
			if ( decodedText !== normalizedText ) {
				for ( const variation of uniqueVariations ) {
					if ( decodedText === variation ) {
						return true; // This is a naked link with encoded text
					}
				}
			}
		} catch ( e ) {
			// If decoding fails, continue
		}

		// Also check for special cases like mailto: and tel: links
		if ( normalizedHref.startsWith( 'mailto:' ) ) {
			const email = normalizedHref.replace( /^mailto:/, '' );
			if ( normalizedText === email || normalizedText === normalizedHref ) {
				return true;
			}
		}

		if ( normalizedHref.startsWith( 'tel:' ) ) {
			const phone = normalizedHref.replace( /^tel:/, '' );
			if ( normalizedText === phone || normalizedText === normalizedHref ) {
				return true;
			}
		}

		return false; // Not a naked link
	},
	options: {},
	metadata: {
		impact: 'minor',
		messages: {
			pass: 'Link has descriptive text that differs from its URL',
			fail: 'Link displays the raw URL as its text content',
		},
	},
};