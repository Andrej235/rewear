using FluentResults;

namespace ReWear.Errors;

public class NotFound(string message) : Error(message) { }
