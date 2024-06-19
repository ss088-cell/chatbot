// Function to create and return the HTML interface
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index');
}

// Function to handle user input and return a response
function getResponse(userInput, userEmail) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Updates"); // Use the "Updates" sheet
  var data = sheet.getDataRange().getValues();
  Logger.log('User Input: ' + userInput);
  
  var normalizedInput = userInput ? userInput.toLowerCase().trim() : '';
  var response = findResponse(normalizedInput, data);

  // If no response found, prompt for email and log unanswered question
  if (response === "Sorry, I don't have an answer for that.") {
    if (userEmail) {
      logUnansweredQuestion(userInput, userEmail);
      sendAlertEmail(userInput); // Send alert email to admin
      return "Apologies, I currently don't have the answer but will definitely get back to you soon.";
    } else {
      return "Apologies, I currently don't have the answer. Could you please provide your email so I can follow up?";
    }
  }

  return response;
}

// Function to find a response from the sheet based on user input
function findResponse(userInput, data) {
  // Check if data is empty or undefined
  if (!data || data.length == 0) {
    Logger.log('Data is empty or undefined');
    return "Sorry, I don't have an answer for that.";
  }

  // Define keywords to improve matching
  var keywords = ["black duck", "blackduck", "blackduck software"];

  // Iterate through the sheet to find a match
  for (var i = 1; i < data.length; i++) {
    var question = data[i][0];
    var response = data[i][1];
    if (question) {
      question = question.toLowerCase().trim();
      // Check if the normalized input includes any of the keywords
      if (keywords.some(keyword => userInput.includes(keyword))) {
        Logger.log('Keyword match found: ' + response);
        return response;
      }
      // Fallback to flexible matching if no keyword match
      if (question.includes(userInput) || userInput.includes(question)) {
        Logger.log('Flexible match found: ' + response);
        return response;
      }
    }
  }
  
  Logger.log('No match found');
  return "Sorry, I don't have an answer for that.";
}

// Function to log unanswered questions and email in a new sheet
function logUnansweredQuestion(question, email) {
  var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Unanswered Questions");
  
  // Check if the sheet exists
  if (!logSheet) {
    // Handle case where sheet doesn't exist
    Logger.log("Sheet 'Unanswered Questions' not found");
    return;
  }
  
  // Append row with timestamp, question, and email
  logSheet.appendRow([new Date(), question, email]);
}

// Function to send an alert email to the admin
function sendAlertEmail(question, userEmail) {
  var adminEmail = "shreyasshete088@gmail.com"; // Replace with the admin's email address
  var subject = "Alert from Chatbot: Unanswered Question";
  
  // Format the email body with a table
  var message = "Hi,<br><br>" +
                "We have received an unanswered question:<br><br>" +
                "<table border='1' style='border-collapse: collapse;'>" +
                "<tr><th>Timestamp</th><th>Question</th><th>User Email</th></tr>" +
                "<tr><td>" + new Date() + "</td><td>" + question + "</td><td>" + userEmail + "</td></tr>" +
                "</table><br><br>" +
                "Your Buddy,<br>" +
                "Chatbot<br><br>" +
                "----------------------------------------<br>" +
                "This is an automated message from Chatbot.<br>" +
                "Please do not reply to this email.<br>";
  
  MailApp.sendEmail({
    to: adminEmail,
    subject: subject,
    htmlBody: message
  });
}
