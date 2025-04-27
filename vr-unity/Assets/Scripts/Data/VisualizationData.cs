using System;
using System.Collections.Generic;

[Serializable]
public class VisualizationData
{
    public string sessionId;      
    public string codeId; 
    public List<VariableData> variables;
    public List<ArrayData> arrays;
    public List<LoopData> loops;
    public List<FunctionData> functions;
    public List<ConditionalData> conditionals;
}

[Serializable]
public class VariableData
{
    public string name;
    public string value;
    public string type;
}

[Serializable]
public class ArrayData
{
    public string name;
    public List<string> elements;
    public int length;
}

[Serializable]
public class LoopData
{
    public string type;
    public string variable;
    public string body;
}

[Serializable]
public class FunctionData
{
    public string name;
    public List<string> @params; // Using @params because 'params' is a keyword
}

[Serializable]
public class ConditionalData
{
    public string type;
    public bool hasElse;
}