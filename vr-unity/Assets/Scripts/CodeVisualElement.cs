using UnityEngine;

public class CodeVisualElement : MonoBehaviour
{
    public string Id { get; private set; }
    public string ElementType { get; private set; }
    public string Label { get; private set; }
    public string CurrentState { get; private set; }
    public string CurrentColor { get; private set; }
    
    [SerializeField] private TextMesh labelText;
    [SerializeField] private Renderer visualRenderer;
    
    private VisualizationManager visualizationManager;
    
    public void Initialize(string id, string type, string label)
    {
        Id = id;
        ElementType = type;
        Label = label;
        CurrentState = "inactive";
        CurrentColor = "#FFFFFF"; // Default white
        
        if (labelText != null)
        {
            labelText.text = label;
        }
        
        visualizationManager = FindObjectOfType<VisualizationManager>();
    }
    
    public void SetState(string state, string hexColor)
    {
        CurrentState = state;
        CurrentColor = hexColor;
        
        // Update visual appearance
        if (visualRenderer != null && ColorUtility.TryParseHtmlString(hexColor, out Color color))
        {
            visualRenderer.material.color = color;
        }
        
        // Notify the visualization manager that this element changed
        if (visualizationManager != null)
        {
            visualizationManager.NotifyVisualizationChanged();
        }
    }
    
    public void OnInteract()
    {
        // Handle user interaction (e.g., selecting this element)
        SetState("active", "#00FF00"); // Change to green when active
    }
}