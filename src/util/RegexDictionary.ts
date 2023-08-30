export const RegexDictionary = {
    EmailAddress: new RegExp(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    ),
    AlphaNumeric: new RegExp(/^([a-zA-Z0-9_.:-\s]){1,50}$/), // John Smith
    AlphaTwoDigitsCode: new RegExp(/^([a-zA-Z0-9_.:-\s]){1,2}$/), // 01
    AlphaThreeDigitsCode: new RegExp(/^([a-zA-Z0-9_.:-\s]){1,3}$/), // 012
    AlphaFourDigitsCode: new RegExp(/^([a-zA-Z0-9_.:-\s]){1,4}$/), // 0123
    AlphaFiveDigitsCode: new RegExp(/^([a-zA-Z0-9_.:-\s]){1,5}$/), // 01256
    PhoneNumber: new RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/), // 123456789123456
    DocumentNumber: new RegExp(/^([a-zA-Z0-9_-\s.]){1,15}$/), // 123456789123456
};