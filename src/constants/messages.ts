export const userMessages = {
  VALIDATION_ERROR: 'Validation error',
  NAME_REQUIRED: 'Name is required field',
  NAME_STRING: 'Name is a string',
  NAME_LENGTH_3_TO_100: 'Name length from 3 to 100 characters',
  //email
  EMAIL_EXIST: 'Email already exist',
  EMAIL_REQUIRED: 'Email is required field',
  EMAIL_INVALID: 'Email is invalid',
  //password
  PASSWORD_REQUIRED: 'Passord is required field',
  PASSWORD_STRING: 'Passord is a string',
  PASSWORD_LENGTH_6_TO_50: 'Password length from 6 to 50 characters',
  //confirm_password
  CONFIRM_PASSWORD_REQUIRED: 'Passord confirm is required field',
  CONFIRM_PASSWORD_STRING: 'Passord confirm is a string',
  CONFIRM_PASSWORD_LENGTH_6_TO_50: 'Passord confirm length from 6 to 50 characters',
  CONFIRM_PASSWORD_NOT_MATCH: 'Password confirm not match',
  //date of birth
  DATE_OF_BIRTH_IS_ISO2801: 'Date of birth must be ISO28001',
  // access_token
  ACCESS_TOKEN_REQUIRED: 'Access tokent is required',
  REFRESH_TOKEN_REQUIRED: 'Refresh tokent is required',
  EMAIL_VERIFY_TOKEN_REQUIRED: 'Email Verify token is required',

  // not found
  USER_NOT_FOUND: 'User not found',
  EMAIL_VERIFIED_BEFORE: 'Email already verified before',

  FORGOT_PASSWORD_TOKEN_REQUIRED: 'Refresh tokent is required',

  NAME_MUST_BE_STRING: 'Name must be a string',
  USERNAME_MUST_BE_STRING: 'Name must be a string',
  USERNAME_LIMIT_LENGHT: 'Username limit from 1 to 40 charactor',
  BIO_MUST_BE_STRING: 'Bio must be a string',
  LOCATION_MUST_BE_STRING: 'Location must be a string',
  WEBSITE_MUST_BE_STRING: 'Website must be a string',

  IMG_URL_MUST_BE_STRING: ' Image Url must be a string'
}

export const tweetMessage = {
  TYPE_INVALID: 'Type Invalid',
  AUDIENCE_INVALID: 'Audience Invalid',
  PARENT_ID_MUST_BE_A_OBJECT_ID: 'Parent id must be a object id',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  CONTENT_MUST_BE_A_NON_EMPLTY_SRING: 'Content must be a non empty string',
  CONTENT_MUST_BE_A_EMPTY_STRING: 'Content must be a empty string',
  HASHTAGS_MUST_BE_ARRAY_STRING: 'Hastags must be array string',
  MENTIONS_MUST_BE_ARRAY_OF_USER_ID: 'Mention must be array of user id',
  MEDIAS_MUST_BE_ARRAY_OF_MEDIA_OBJECT: 'Medias must be array of media object'
}
