using FluentResults;

namespace Template.Errors;

public class Forbidden(string message) : Error(message) { }
