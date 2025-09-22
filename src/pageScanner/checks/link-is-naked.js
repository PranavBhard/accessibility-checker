export default {
	id: 'link-is-naked',
	evaluate( node ) {
		// Skip if the link has no href attribute
		if ( ! node.hasAttribute( 'href' ) ) {
			return false;
		}

		// Get the href value
		const href = node.getAttribute( 'href' ).trim();
		
		// Skip empty hrefs or anchors
		if ( ! href || href === '#' || href.startsWith( '#' ) ) {
			return false;
		}

		// Get the text content of the link
		const linkText = node.textContent.trim();
		
		// Skip if link has no text content
		if ( ! linkText ) {
			return false;
		}

		// Check if link has aria-label that's different from href
		const ariaLabel = node.getAttribute( 'aria-label' );
		if ( ariaLabel && ariaLabel.trim() !== '' && ariaLabel.trim() !== href ) {
			return false;
		}

		// Check aria-labelledby
		if ( node.hasAttribute( 'aria-labelledby' ) ) {
			const labelledbyIds = node.getAttribute( 'aria-labelledby' ).split( ' ' );
			const labelledbyElements = labelledbyIds.map( ( id ) => document.getElementById( id ) ).filter( Boolean );
			const labelledbyText = labelledbyElements.map( ( el ) => el.textContent.trim() ).join( ' ' ).trim();
			if ( labelledbyText && labelledbyText !== href ) {
				return false;
			}
		}

		// Normalize URLs for comparison
		// Remove protocol (http://, https://, ftp://, etc.)
		const normalizeUrl = ( url ) => {
			return url
				.replace( /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '' ) // Remove protocol
				.replace( /^www\./, '' ) // Remove www.
				.replace( /\/$/, '' ); // Remove trailing slash
		};

		// Also check for common URL patterns that might be in the text
		const urlPatterns = [
			/^https?:\/\//i,
			/^ftp:\/\//i,
			/^mailto:/i,
			/^tel:/i,
			/^www\./i,
			/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/|$)/ // domain.com pattern
		];

		// Check if the text looks like a URL
		const textLooksLikeUrl = urlPatterns.some( pattern => pattern.test( linkText ) );
		
		if ( ! textLooksLikeUrl ) {
			return false;
		}

		// Normalize both href and text for comparison
		const normalizedHref = normalizeUrl( href );
		const normalizedText = normalizeUrl( linkText );

		// Check if the normalized text matches the normalized href
		// or if the text is contained within the href (or vice versa)
		if ( normalizedText === normalizedHref || 
			 normalizedHref.includes( normalizedText ) || 
			 normalizedText.includes( normalizedHref ) ) {
			return true;
		}

		// Additional check for mailto: and tel: links
		if ( href.startsWith( 'mailto:' ) ) {
			const email = href.substring( 7 ).split( '?' )[0]; // Remove mailto: and any query params
			if ( linkText === email || linkText === href ) {
				return true;
			}
		}

		if ( href.startsWith( 'tel:' ) ) {
			const phone = href.substring( 4 ); // Remove tel:
			if ( linkText === phone || linkText === href ) {
				return true;
			}
		}

		return false;
	},
};