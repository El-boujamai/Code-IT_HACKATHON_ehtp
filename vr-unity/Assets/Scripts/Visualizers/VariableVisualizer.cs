using UnityEngine;
using TMPro;

public class VariableVisualizer : MonoBehaviour
{
    [SerializeField] private TextMeshPro nameText;
    [SerializeField] private TextMeshPro valueText;
    [SerializeField] private TextMeshPro typeText;
    [SerializeField] private Material numberMaterial;
    [SerializeField] private Material stringMaterial;
    [SerializeField] private Material booleanMaterial;
    [SerializeField] private MeshRenderer containerRenderer;
    
    public void SetVariable(string name, string value, string type)
    {
        nameText.text = name;
        valueText.text = value ?? "undefined";
        typeText.text = type;
        
        // Set color based on type
        switch (type)
        {
            case "number":
                containerRenderer.material = numberMaterial;
                break;
            case "string":
                containerRenderer.material = stringMaterial;
                break;
            case "boolean":
                containerRenderer.material = booleanMaterial;
                break;
            default:
                // Default material
                break;
        }
    }
    
    public void Highlight()
    {
        transform.localScale = new Vector3(1.2f, 1.2f, 1.2f);
    }
    
    public void Unhighlight()
    {
        transform.localScale = Vector3.one;
    }
}