import React from 'react';

export const renderFormattedText = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('*') || line.trim().startsWith('•')) {
      const content = line.replace(/^[\s]*[*•]\s*/, '').trim();
      elements.push(
        <div key={`list-${idx}`} className="formatted-list-item">
          <strong>• {content}</strong>
        </div>
      );
    } else if (line.trim()) {

      elements.push(
        <p key={`para-${idx}`} className="formatted-paragraph">
          {line}
        </p>
      );
    } else if (idx < lines.length - 1) {

      elements.push(<div key={`space-${idx}`} className="formatted-space" />);
    }
  });

  return elements;
};
