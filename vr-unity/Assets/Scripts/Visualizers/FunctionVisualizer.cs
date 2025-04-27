using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class FunctionVisualizer : MonoBehaviour
{
    [SerializeField] private TextMeshPro nameText;
    [SerializeField] private TextMeshPro paramsText;
    
    public void SetFunction(string name, List<string> parameters)
    {
        nameText.text = name;
        
        if (parameters != null && parameters.Count > 0)
        {
            paramsText.text = string.Join(", ", parameters);
        }
        else
        {
            paramsText.text = "()";
        }
    }
}