using UnityEngine;
using System.Collections.Generic;

public class VisualizationManager : MonoBehaviour
{
    private WebSocketServer webSocketServer;
    private string sessionId;
    private string currentCodeId;

    // List of visualization elements in the scene
    private List<WebSocketServer.VisualizationElement> elements = new List<WebSocketServer.VisualizationElement>();

    void Start()
    {
        webSocketServer = WebSocketServer.Instance;
        if (webSocketServer == null)
        {
            Debug.LogError("WebSocketServer instance not found!");
        }

        // Generate a unique session ID
        sessionId = System.Guid.NewGuid().ToString();
    }

    // Call this method when you update the visualization in Unity
    public void UpdateVisualization(string codeId)
    {
        if (webSocketServer == null) return;

        currentCodeId = codeId;

        // Gather data from your visualization elements
        List<WebSocketServer.VisualizationElement> elementData =
            new List<WebSocketServer.VisualizationElement>();

        // Example: populate visualization elements from your scene
        // This would be adapted based on your actual visualization implementation
        foreach (var element in FindObjectsOfType<CodeVisualElement>())
        {
            var data = new WebSocketServer.VisualizationElement
            {
                id = element.Id,
                type = element.ElementType,
                label = element.Label,
                position = new WebSocketServer.Vector3Data
                {
                    x = element.transform.position.x,
                    y = element.transform.position.y,
                    z = element.transform.position.z
                },
                state = element.CurrentState,
                color = element.CurrentColor
            };

            elementData.Add(data);
        }

        // Create visualization data package
        var visualData = new WebSocketServer.VisualizationData
        {
            sessionId = sessionId,
            codeId = currentCodeId,
            elements = elementData.ToArray(),
            cameraPosition = JsonUtility.ToJson(Camera.main.transform.position),
            userInteraction = GetUserInteractionData()
        };

        // Send the update
        webSocketServer.SendVisualizationUpdate(visualData);
    }

    // Example method to get user interaction data
    private string GetUserInteractionData()
    {
        // Implement based on how you track user interactions
        // This could include what objects they're looking at, selecting, etc.
        return JsonUtility.ToJson(new
        {
            lastSelectedId = "variable_x",
            lookDirection = Camera.main.transform.forward
        });
    }

    // Call this whenever the visualization changes
    public void NotifyVisualizationChanged()
    {
        if (!string.IsNullOrEmpty(currentCodeId))
        {
            UpdateVisualization(currentCodeId);
        }
    }

    // Add this to your VisualizationManager or create a test script
    public void CreateTestVisualization()
    {
        // Create some test elements
        GameObject varObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
        varObj.transform.position = new Vector3(-2, 0, 0);
        var varElement = varObj.AddComponent<CodeVisualElement>();
        varElement.Initialize("var_x", "variable", "x = 10");

        GameObject funcObj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        funcObj.transform.position = new Vector3(2, 0, 0);
        var funcElement = funcObj.AddComponent<CodeVisualElement>();
        funcElement.Initialize("func_main", "function", "main()");

        // Update visualization
        UpdateVisualization("test_code_123");
    }
}