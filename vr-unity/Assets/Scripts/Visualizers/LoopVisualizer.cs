using UnityEngine;
using TMPro;

public class LoopVisualizer : MonoBehaviour
{
    [SerializeField] private TextMeshPro typeText;
    [SerializeField] private TextMeshPro variableText;
    
    public void SetLoop(string type, string variable)
    {
        typeText.text = type;
        variableText.text = variable;
    }
}