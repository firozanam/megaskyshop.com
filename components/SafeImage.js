import Image from 'next/image';
import { useState } from 'react';

const SafeImage = ({ src, alt, layout, objectFit, ...props }) => {
    const [imageSrc, setImageSrc] = useState(src);

    const handleError = () => {
        console.error(`Failed to load image: ${src}`);
        setImageSrc('/images/placeholder.jpg');
    };

    // Convert legacy props to modern Next.js 13 Image props
    const modernProps = {
        ...props,
        style: {
            ...props.style,
            objectFit: objectFit || 'cover',
        },
        fill: layout === 'fill',
        sizes: props.sizes || '100vw',
    };

    if (!modernProps.fill) {
        modernProps.width = props.width || 500;
        modernProps.height = props.height || 500;
    }

    return (
        <Image
            src={imageSrc}
            alt={alt || 'Product image'}
            onError={handleError}
            {...modernProps}
            priority={props.priority || false}
            quality={props.quality || 75}
        />
    );
};

export default SafeImage;
