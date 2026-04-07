type MixedTextProps = {
    text: string;
    as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';
    className?: string;
    title?: string;
  };
  
  export default function MixedText({
    text,
    as = 'span',
    className = '',
    title,
  }: MixedTextProps) {
    const Component = as;
  
    return (
      <Component
        dir="auto"
        title={title ?? text}
        className={className}
        style={{ unicodeBidi: 'plaintext' }}
      >
        {text}
      </Component>
    );
  }