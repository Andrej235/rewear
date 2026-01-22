using FluentResults;

namespace Template.Errors;

public class NotFound(string message) : Error(message) { }
