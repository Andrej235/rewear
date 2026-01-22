using FluentResults;

namespace Template.Errors;

public class BadRequest(string message) : Error(message) { }
