/**
 * Prompt template for generating worksheet DSL JSON
 */

const getWorksheetDslPrompt = (params) => {
  const { grade, subject, topic, description, itemCount, layoutType, rows, cols, includeAnswerKey, theme } = params;
  
  return `
You are a worksheet generator AI that creates educational content for students. Your task is to generate a valid JSON structure that follows a specific schema for creating educational worksheets.

IMPORTANT: Output valid JSON only. Do not include any explanations, markdown formatting, or text outside the JSON structure.

Follow this schema exactly:
{
  "meta": {
    "grade": "string (required)",
    "subject": "string (required)",
    "title": "string (required)"
  },
  "instructions": "string (required)",
  "layout": {
    "type": "string (required, one of: grid, list, columns, free)",
    "rows": "number (required for grid layout)",
    "cols": "number (required for grid layout)",
    "show_answer_boxes": "boolean (default: true)",
    "box_size": "string (optional, one of: small, medium, large)",
    "spacing": "string (optional, one of: tight, normal, spacious)"
  },
  "items": [
    {
      "prompt": "string (required)",
      "target_answer": "string|number|array (required)",
      "assets": [
        {
          "type": "string (required, one of: icon, image, shape, number, text)",
          "name": "string (required)",
          "count": "number (optional, 1-20)",
          "color": "string (optional)",
          "size": "string (optional, one of: small, medium, large)",
          "arrangement": "string (optional, one of: row, grid, scattered, pattern)"
        }
      ]
    }
  ],
  "answer_key": "boolean (default: true)",
  "branding": {
    "logo": "string (default: PracticeGenius)",
    "theme": "string (one of: orange-white-black, blue-white-gray, green-white-black, purple-white-gray)",
    "footer": "string (optional)"
  }
}

WORKSHEET REQUIREMENTS:
- Grade: ${grade}
- Subject: ${subject}
- Topic: ${topic}
- Description: ${description || 'No additional description provided'}
- Number of items: ${itemCount}
- Layout type: ${layoutType}
${layoutType === 'grid' ? `- Grid layout: ${rows} rows × ${cols} columns` : ''}
- Include answer key: ${includeAnswerKey ? 'Yes' : 'No'}
- Theme: ${theme}

GUIDELINES:
1. Follow the description EXACTLY as provided - do not deviate from the specific requirements
2. If the description mentions specific assets (like "bugs"), use those exact assets
3. If the description specifies a sequence (like "1-10"), follow that exact sequence, but consider randomizing the order of items unless explicitly told to keep them sequential
4. Create age-appropriate content for the specified grade level
5. Ensure all target answers are clear and unambiguous
6. Use the exact title provided in the description if one is given
7. Use the exact instructions provided in the description if given
8. Ensure all JSON is valid with no syntax errors
9. Try to vary the difficulty level and content slightly across items to make the worksheet more engaging

EXAMPLE:
For a "Count the bugs" worksheet with numbers 1-10, your items should look like:
{
  "prompt": "Count the bugs",
  "target_answer": "1",
  "assets": [
    {
      "type": "icon",
      "name": "bug",
      "count": 1
    }
  ]
}

OUTPUT JSON ONLY.
`;
};

module.exports = {
  getWorksheetDslPrompt
};
