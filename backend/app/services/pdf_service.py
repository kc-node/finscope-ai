# Processes PDF

import pdfplumber

def extract_text_from_pdf(pdf_path):
    extracted_text = ""

    # open the pdf 
    with pdfplumber.open(pdf_path) as pdf:
        # get all the pages in pdf
        for page in pdf.pages:
            # extract all readable text from the page being looked at 
            text = page.extract_text()

            if text:
                # Combines all page's text into one big string 
                extracted_text += text + "\n"

    return extracted_text