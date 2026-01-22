using FluentResults;

namespace Template.Errors;

public class InternalError(string message) : Error(message) { }
