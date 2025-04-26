using UnityEngine;
using TMPro;

public class LoopVisualizer : MonoBehaviour
{
    [SerializeField] private TextMeshPro typeText;
    [SerializeField] private TextMeshPro variableText;
    [SerializeField] private GameObject loopAnimationObject;
    
    public void SetLoop(string type, string variable)
    {
        typeText.text = type + " loop";
        variableText.text = "Variable: " + variable;
        
        // Start animation
        var animator = loopAnimationObject.GetComponent<Animator>();
        if (animator != null)
        {
            animator.SetTrigger("StartLoop");
        }
    }
}