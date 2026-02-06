import React from 'react';

interface PaperHeaderProps {
  title: string;
  authors: string[];
  abstract: string;
  links?: {
    label: string;
    url: string;
    icon?: React.ReactNode;
  }[];
}

export const PaperHeader: React.FC<PaperHeaderProps> = ({ title, authors, abstract, links }) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 text-center leading-tight">
          {title}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-4 mb-8 text-lg text-slate-600">
          {authors.map((author, index) => (
            <span key={index} className="after:content-[','] last:after:content-none">
              {author}
            </span>
          ))}
        </div>

        {links && links.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                {link.icon}
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-4 uppercase tracking-wider text-center">Abstract</h2>
          <p className="text-lg text-slate-600 leading-relaxed text-justify">
            {abstract}
          </p>
        </div>
      </div>
    </div>
  );
};
