import React from 'react';
import TagsField from '../utils/edit_tags';

interface Props {
  label?: string;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  maxTags: number;
  required?: boolean;
}

const Tags = ({ label, tags, setTags, maxTags, required = false }: Props) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between">
          <div className="text-xs ml-1 font-medium uppercase text-gray-500">
            {label}
            {required && '*'} ({tags.length}/{maxTags})
          </div>
          <div className="text-xs ml-1 font-medium text-gray-500">Press &apos;Enter&apos; to confirm</div>
        </div>
      )}

      <TagsField tags={tags} setTags={setTags} maxTags={maxTags} />
    </div>
  );
};

export default Tags;
