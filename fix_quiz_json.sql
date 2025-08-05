-- Fix the malformed JSON in quiz_data
-- The current data: "[\"It values future decision flexibility\", \"It compares stock prices to peers\" ,It ignores risk\", \"It only applies to dividends\"]"
-- The third option is missing an opening quote

UPDATE content_item 
SET quiz_data = '["It values future decision flexibility", "It compares stock prices to peers", "It ignores risk", "It only applies to dividends"]'
WHERE quiz_data LIKE '%It ignores risk%' 
AND quiz_data LIKE '%It compares stock prices to peers%';

-- Verify the fix
SELECT id, quiz_question, quiz_data 
FROM content_item 
WHERE quiz_data LIKE '%It ignores risk%'; 