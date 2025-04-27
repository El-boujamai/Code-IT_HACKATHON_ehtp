# Unity Project Setup for CodeVision VR

Let me provide you with details on the Unity project setup, focusing on the main visualization scene hierarchy and the essential components.

## Unity Project Structure

First, create a new Unity project with these settings:
- **Unity Version**: 2022.3 LTS (or newer for better VR support)
- **Template**: VR template (if available) or 3D Core
- **Render Pipeline**: URP (Universal Render Pipeline) for better VR performance

## Required Packages

Install these packages via the Package Manager:
1. XR Interaction Toolkit
2. XR Plugin Management
3. OpenXR Plugin
4. Newtonsoft JSON (for parsing JSON data)
5. NativeWebSocket (from Git URL: `https://github.com/endel/NativeWebSocket.git`)

## Project Folder Structure

```
Assets/
├── Prefabs/
│   ├── VariablePrefab.prefab
│   ├── ArrayPrefab.prefab
│   ├── LoopPrefab.prefab
│   ├── FunctionPrefab.prefab
│   └── ConditionalPrefab.prefab
├── Scripts/
│   ├── CodeVisualization.cs
│   ├── WebSocketServer.cs
│   ├── MainThreadDispatcher.cs
│   ├── Visualizers/
│   │   ├── VariableVisualizer.cs
│   │   ├── ArrayVisualizer.cs
│   │   ├── LoopVisualizer.cs
│   │   └── FunctionVisualizer.cs
│   └── Data/
│       └── VisualizationData.cs
├── Materials/
│   ├── VariableMaterial.mat
│   ├── ArrayMaterial.mat
│   ├── LoopMaterial.mat
│   └── FunctionMaterial.mat
├── Scenes/
│   └── CodeVisualizationScene.unity
└── Settings/
    └── XR Settings
```

## Main Visualization Scene Hierarchy

```
CodeVisualizationScene
├── XRRig
│   ├── Camera Offset
│   │   ├── Main Camera
│   │   ├── LeftHand Controller
│   │   └── RightHand Controller
├── Lighting
│   ├── Directional Light
│   └── Ambient Light
├── Environment
│   ├── Floor
│   └── Reference Grid
├── CodeVisualizationManager
│   └── VisualizationRoot
├── NetworkManager
└── MainThreadDispatcher
```

## Main GameObjects and Components

### CodeVisualizationManager GameObject

This is the main GameObject that handles receiving and visualizing code data:

```
CodeVisualizationManager
├── Transform
├── CodeVisualization.cs
└── Components:
    ├── Reference to VisualizationRoot Transform
    └── References to Prefabs
```

```csharp
// CodeVisualization.cs - Full script implementation for the main visualization manager

using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Newtonsoft.Json;
using NativeWebSocket;

public class CodeVisualization : MonoBehaviour
{
    [Header("Visualization Prefabs")]
    [SerializeField] private GameObject variablePrefab;
    [SerializeField] private GameObject arrayPrefab;
    [SerializeField] private GameObject loopPrefab;
    [SerializeField] private GameObject functionPrefab;
    [SerializeField] private GameObject conditionalPrefab;
    
    [Header("Scene References")]
    [SerializeField] private Transform visualizationRoot;
    [SerializeField] private Transform playerCamera;
    
    [Header("Settings")]
    [SerializeField] private float elementSpacing = 1.5f;
    [SerializeField] private float visualizationScale = 0.5f;
    [SerializeField] private bool autoArrangeElements = true;
    
    private WebSocket webSocket;
    private string dataFilePath;
    private Dictionary<string, GameObject> visualElements = new Dictionary<string, GameObject>();
    
    private void Start()
    {
        // Make sure the VisualizationRoot exists
        if (visualizationRoot == null)
        {
            visualizationRoot = new GameObject("VisualizationRoot").transform;
            visualizationRoot.SetParent(transform);
            visualizationRoot.localPosition = Vector3.zero;
        }
        
        // Path to look for data file (this would be coordinated with the backend)
        dataFilePath = Path.Combine(Application.persistentDataPath, "current-visualization.json");
        Debug.Log($"Looking for visualization data at: {dataFilePath}");
        
        // Set up periodic checking for file changes if using file-based approach
        InvokeRepeating("CheckForVisualizationData", 2.0f, 1.0f);
        
        // Set up WebSocket connection
        ConnectToWebSocket();
    }
    
    async void ConnectToWebSocket()
    {
        webSocket = new WebSocket("ws://localhost:5000");

        webSocket.OnOpen += () => {
            Debug.Log("Connection open!");
            // Register with server once connected
            SendRegistrationMessage();
        };

        webSocket.OnError += (e) => {
            Debug.LogError("WebSocket error: " + e);
        };

        webSocket.OnClose += (e) => {
            Debug.Log("Connection closed!");
        };

        webSocket.OnMessage += (bytes) => {
            var message = System.Text.Encoding.UTF8.GetString(bytes);
            ProcessWebSocketMessage(message);
        };

        // Keep sending messages to keep the connection alive
        InvokeRepeating("SendWebSocketPing", 0.0f, 5.0f);
        
        // Connect to WebSocket server
        try {
            await webSocket.Connect();
        }
        catch (Exception e) {
            Debug.LogError($"WebSocket connection error: {e.Message}");
        }
    }
    
    void SendRegistrationMessage()
    {
        if (webSocket.State == WebSocketState.Open)
        {
            string registrationMsg = JsonUtility.ToJson(new { type = "register", client = "unity" });
            webSocket.SendText(registrationMsg);
        }
    }
    
    void SendWebSocketPing()
    {
        if (webSocket != null && webSocket.State == WebSocketState.Open)
        {
            try {
                webSocket.SendText("ping");
            }
            catch (Exception e) {
                Debug.LogError($"Error sending ping: {e.Message}");
            }
        }
    }
    
    void ProcessWebSocketMessage(string message)
    {
        try
        {
            // Parse the incoming message
            Dictionary<string, object> msgData = JsonConvert.DeserializeObject<Dictionary<string, object>>(message);
            
            if (msgData.ContainsKey("type") && msgData["type"].ToString() == "visualization_data")
            {
                // Extract the data part from the message
                string dataJson = JsonConvert.SerializeObject(msgData["data"]);
                VisualizationData data = JsonConvert.DeserializeObject<VisualizationData>(dataJson);
                
                // Process the visualization data
                MainThreadDispatcher.Instance.Enqueue(() => {
                    CreateVisualization(data);
                });
                
                Debug.Log("Created visualization from WebSocket data");
            }
        }
        catch (Exception e)
        {
            Debug.LogError("Error processing WebSocket message: " + e.Message);
        }
    }
    
    void CheckForVisualizationData()
    {
        if (File.Exists(dataFilePath))
        {
            try
            {
                string json = File.ReadAllText(dataFilePath);
                var data = JsonConvert.DeserializeObject<VisualizationData>(json);
                
                // Create visualization based on data
                CreateVisualization(data);
                
                Debug.Log("Created visualization from file data");
                
                // Optional: Remove file after processing
                File.Delete(dataFilePath);
            }
            catch (Exception e)
            {
                Debug.LogError("Error reading visualization data: " + e.Message);
            }
        }
    }
    
    void CreateVisualization(VisualizationData data)
    {
        // Clear previous visualization
        ClearVisualization();
        
        // Get information about what we have to visualize
        int totalElements = 0;
        if (data.variables != null) totalElements += data.variables.Count;
        if (data.arrays != null) totalElements += data.arrays.Count;
        if (data.loops != null) totalElements += data.loops.Count;
        if (data.functions != null) totalElements += data.functions.Count;
        
        // Create section headers
        GameObject sectionsParent = new GameObject("Sections");
        sectionsParent.transform.SetParent(visualizationRoot);
        sectionsParent.transform.localPosition = new Vector3(0, 3, 0);
        
        // Create new visualization elements
        float startX = -5.0f;
        
        // Variables section
        if (data.variables != null && data.variables.Count > 0)
        {
            CreateVariables(data.variables, startX);
        }
        
        // Arrays section 
        if (data.arrays != null && data.arrays.Count > 0)
        {
            float arraysX = startX + (data.variables?.Count ?? 0) * elementSpacing;
            CreateArrays(data.arrays, arraysX);
        }
        
        // Loops section
        if (data.loops != null && data.loops.Count > 0)
        {
            CreateLoops(data.loops, 0, -3);
        }
        
        // Functions section
        if (data.functions != null && data.functions.Count > 0)
        {
            CreateFunctions(data.functions, 5, 0);
        }
        
        // If we have the player's position, adjust the visualization to face them
        if (playerCamera != null && autoArrangeElements)
        {
            ArrangeVisualizationAroundPlayer();
        }
    }
    
    void ArrangeVisualizationAroundPlayer()
    {
        Vector3 playerPos = playerCamera.position;
        playerPos.y = visualizationRoot.position.y; // Keep the same height
        
        // Make the visualization root face the player
        Vector3 lookDir = playerPos - visualizationRoot.position;
        if (lookDir != Vector3.zero)
        {
            visualizationRoot.rotation = Quaternion.LookRotation(lookDir);
        }
        
        // Position the visualization at a comfortable distance
        float distanceFromPlayer = 2.0f;
        Vector3 newPos = playerPos - (playerCamera.forward * distanceFromPlayer);
        newPos.y = visualizationRoot.position.y; // Maintain height
        
        visualizationRoot.position = newPos;
    }
    
    void ClearVisualization()
    {
        foreach (var element in visualElements.Values)
        {
            Destroy(element);
        }
        
        visualElements.Clear();
        
        // Also destroy any other children that may have been added
        for (int i = visualizationRoot.childCount - 1; i >= 0; i--)
        {
            Destroy(visualizationRoot.GetChild(i).gameObject);
        }
    }
    
    void CreateVariables(List<VariableData> variables, float startX)
    {
        GameObject variablesParent = new GameObject("Variables");
        variablesParent.transform.SetParent(visualizationRoot);
        
        for (int i = 0; i < variables.Count; i++)
        {
            var variable = variables[i];
            Vector3 position = new Vector3(startX + (i * elementSpacing), 2, 0);
            
            GameObject variableObj = Instantiate(variablePrefab, position, Quaternion.identity, variablesParent.transform);
            variableObj.name = "Variable_" + variable.name;
            
            // Set up variable visualization
            var visualizer = variableObj.GetComponent<VariableVisualizer>();
            if (visualizer != null)
            {
                visualizer.SetVariable(variable.name, variable.value?.ToString(), variable.type);
            }
            
            visualElements[variable.name] = variableObj;
        }
    }
    
    void CreateArrays(List<ArrayData> arrays, float startX)
    {
        GameObject arraysParent = new GameObject("Arrays");
        arraysParent.transform.SetParent(visualizationRoot);
        
        for (int i = 0; i < arrays.Count; i++)
        {
            var array = arrays[i];
            Vector3 position = new Vector3(startX + (i * elementSpacing * 1.5f), 0, 0);
            
            GameObject arrayObj = Instantiate(arrayPrefab, position, Quaternion.identity, arraysParent.transform);
            arrayObj.name = "Array_" + array.name;
            
            // Set up array visualization
            var visualizer = arrayObj.GetComponent<ArrayVisualizer>();
            if (visualizer != null)
            {
                visualizer.SetArray(array.name, array.elements);
            }
            
            visualElements[array.name] = arrayObj;
        }
    }
    
    void CreateLoops(List<LoopData> loops, float startX, float startY)
    {
        GameObject loopsParent = new GameObject("Loops");
        loopsParent.transform.SetParent(visualizationRoot);
        
        for (int i = 0; i < loops.Count; i++)
        {
            var loop = loops[i];
            Vector3 position = new Vector3(startX, startY + (i * -2), 0);
            
            GameObject loopObj = Instantiate(loopPrefab, position, Quaternion.identity, loopsParent.transform);
            loopObj.name = "Loop_" + i;
            
            // Set up loop visualization
            var visualizer = loopObj.GetComponent<LoopVisualizer>();
            if (visualizer != null)
            {
                visualizer.SetLoop(loop.type, loop.variable);
            }
            
            visualElements["loop_" + i] = loopObj;
        }
    }
    
    void CreateFunctions(List<FunctionData> functions, float startX, float startY)
    {
        GameObject functionsParent = new GameObject("Functions");
        functionsParent.transform.SetParent(visualizationRoot);
        
        for (int i = 0; i < functions.Count; i++)
        {
            var function = functions[i];
            Vector3 position = new Vector3(startX, startY + (i * -2), 0);
            
            GameObject functionObj = Instantiate(functionPrefab, position, Quaternion.identity, functionsParent.transform);
            functionObj.name = "Function_" + function.name;
            
            // Set up function visualization
            var visualizer = functionObj.GetComponent<FunctionVisualizer>();
            if (visualizer != null)
            {
                visualizer.SetFunction(function.name, function.params);
            }
            
            visualElements[function.name] = functionObj;
        }
    }
    
    async void OnDestroy()
    {
        if (webSocket != null)
        {
            await webSocket.Close();
        }
    }
}

```

### NetworkManager GameObject

This GameObject handles WebSocket communication with your backend:

```csharp
using UnityEngine;
using System;
using System.Collections.Generic;
using NativeWebSocket;

public class WebSocketServer : MonoBehaviour
{
    [SerializeField] private int port = 8080;
    [SerializeField] private string serverUrl = "ws://localhost:5000";  
    
    private WebSocket webSocket;
    public static WebSocketServer Instance { get; private set; }
    
    public static event Action<string> OnMessageReceived;
    
    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
            return;
        }
    }
    
    async void Start()
    {
        await ConnectToServer();
    }
    
    async System.Threading.Tasks.Task ConnectToServer()
    {
        try
        {
            webSocket = new WebSocket(serverUrl);
            
            webSocket.OnOpen += () => {
                Debug.Log($"Connected to server at {serverUrl}");
                SendRegistration();
            };
            
            webSocket.OnMessage += (bytes) => {
                string message = System.Text.Encoding.UTF8.GetString(bytes);
                Debug.Log($"Message received: {message}");
                
                // Forward message to main thread via dispatcher
                MainThreadDispatcher.Instance.Enqueue(() => {
                    OnMessageReceived?.Invoke(message);
                });
            };
            
            webSocket.OnError += (e) => {
                Debug.LogError($"WebSocket error: {e}");
            };
            
            webSocket.OnClose += (e) => {
                Debug.Log("Connection closed!");
            };
            
            // Start connection
            await webSocket.Connect();
        }
        catch (Exception e)
        {
            Debug.LogError($"WebSocket connection error: {e.Message}");
        }
    }
    
    void SendRegistration()
    {
        if (webSocket.State == WebSocketState.Open)
        {
            string registrationMsg = JsonUtility.ToJson(new { type = "register", client = "unity", port = port });
            webSocket.SendText(registrationMsg);
        }
    }
    
    public async void SendMessage(string message)
    {
        if (webSocket != null && webSocket.State == WebSocketState.Open)
        {
            await webSocket.SendText(message);
        }
        else
        {
            Debug.LogWarning("Cannot send message: WebSocket not connected");
            // Try to reconnect
            await ConnectToServer();
        }
    }
    
    void Update()
    {
        #if !UNITY_WEBGL || UNITY_EDITOR
        if (webSocket != null)
        {
            webSocket.DispatchMessageQueue();
        }
        #endif
    }
    
    async void OnDestroy()
    {
        if (webSocket != null)
        {
            await webSocket.Close();
        }
    }
}

```

### MainThreadDispatcher GameObject

This component handles running callbacks on the main thread:

```csharp
using UnityEngine;
using System;
using System.Collections.Generic;

public class MainThreadDispatcher : MonoBehaviour
{
    private static readonly Queue<Action> executionQueue = new Queue<Action>();
    
    public static MainThreadDispatcher Instance { get; private set; }
    
    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    public void Enqueue(Action action)
    {
        lock (executionQueue)
        {
            executionQueue.Enqueue(action);
        }
    }
    
    void Update()
    {
        lock (executionQueue)
        {
            while (executionQueue.Count > 0)
            {
                Action action = executionQueue.Dequeue();
                action?.Invoke();
            }
        }
    }
}

```

### VisualizationRoot GameObject

This empty GameObject serves as the parent for all visualization elements.

### Data Classes for JSON Deserialization

```csharp
using System;
using System.Collections.Generic;

[Serializable]
public class VisualizationData
{
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

```

## Prefab Setup

Create prefabs for each code element type. Here's how to set up the Variable prefab as an example:

### VariablePrefab

1. Create a cube GameObject
2. Add TextMeshPro objects for name, value, and type
3. Attach the VariableVisualizer script

```csharp
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
    
    // You can add animation or interaction methods here
    public void Highlight()
    {
        // Example: Scale up slightly when highlighted
        transform.localScale = new Vector3(1.2f, 1.2f, 1.2f);
    }
    
    public void Unhighlight()
    {
        transform.localScale = Vector3.one;
    }
}

```

### ArrayPrefab

```csharp
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class ArrayVisualizer : MonoBehaviour
{
    [SerializeField] private TextMeshPro nameText;
    [SerializeField] private GameObject elementPrefab;
    [SerializeField] private Transform elementsParent;
    [SerializeField] private float elementSpacing = 1.0f;
    
    private List<GameObject> elementObjects = new List<GameObject>();
    
    public void SetArray(string name, List<string> elements)
    {
        nameText.text = name;
        
        // Clear any existing elements
        foreach (var obj in elementObjects)
        {
            Destroy(obj);
        }
        elementObjects.Clear();
        
        // Create new elements
        for (int i = 0; i < elements.Count; i++)
        {
            Vector3 position = new Vector3(i * elementSpacing, 0, 0);
            
            GameObject elementObj = Instantiate(elementPrefab, position, Quaternion.identity, elementsParent);
            elementObj.name = "Element_" + i;
            
            // Set the element value
            var textComponent = elementObj.GetComponentInChildren<TextMeshPro>();
            if (textComponent != null)
            {
                textComponent.text = elements[i];
            }
            
            elementObjects.Add(elementObj);
        }
    }
    
    // Animation method for looping through array
    public void AnimateLoop(int index)
    {
        // Reset all elements first
        foreach (var element in elementObjects)
        {
            element.transform.localScale = Vector3.one;
        }
        
        // Highlight the current index
        if (index >= 0 && index < elementObjects.Count)
        {
            elementObjects[index].transform.localScale = new Vector3(1.2f, 1.2f, 1.2f);
        }
    }
}

```

## VR Interaction Setup

Set up VR interactions for the visualization elements:

```csharp
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;

public class VRInteractionHandler : MonoBehaviour
{
    [SerializeField] private Transform codeVisualizationRoot;
    
    // Scaling parameters
    [SerializeField] private float minScale = 0.1f;
    [SerializeField] private float maxScale = 2.0f;
    [SerializeField] private float scaleSpeed = 0.1f;
    
    // Rotation parameters
    [SerializeField] private float rotationSpeed = 100.0f;
    
    // Current state
    private bool isGrabbing = false;
    private Vector3 initialGrabPosition;
    private Quaternion initialGrabRotation;
    private Vector3 initialVisualizationPosition;
    private Quaternion initialVisualizationRotation;
    
    // References to XR controllers
    private XRBaseController leftController;
    private XRBaseController rightController;
    
    void Start()
    {
        // Find the XR controllers in the scene
        var controllers = FindObjectsOfType<XRBaseController>();
        foreach (var controller in controllers)
        {
            if (controller.name.ToLower().Contains("left"))
            {
                leftController = controller;
            }
            else if (controller.name.ToLower().Contains("right"))
            {
                rightController = controller;
            }
        }
    }
    
    void Update()
    {
        // Handle two-handed scaling
        if (leftController != null && rightController != null)
        {
            if (leftController.inputDevice.TryGetFeatureValue(UnityEngine.XR.CommonUsages.gripButton, out bool leftGrip) &&
                rightController.inputDevice.TryGetFeatureValue(UnityEngine.XR.CommonUsages.gripButton, out bool rightGrip))
            {
                if (leftGrip && rightGrip)
                {
                    // Calculate distance between controllers for scaling
                    float distance = Vector3.Distance(leftController.transform.position, rightController.transform.position);
                    
                    // Use distance to scale the visualization
                    // This is a simple approach - you might want something more sophisticated
                    if (codeVisualizationRoot != null)
                    {
                        // Scale based on distance between controllers
                        codeVisualizationRoot.localScale = new Vector3(
                            Mathf.Clamp(distance * 0.5f, minScale, maxScale),
                            Mathf.Clamp(distance * 0.5f, minScale, maxScale),
                            Mathf.Clamp(distance * 0.5f, minScale, maxScale)
                        );
                    }
                }
            }
        }
    }
    
    // Method to be called by XR Grab Interactable
    public void OnGrabStart(XRBaseInteractor interactor)
    {
        if (!isGrabbing && codeVisualizationRoot != null)
        {
            isGrabbing = true;
            initialGrabPosition = interactor.transform.position;
            initialGrabRotation = interactor.transform.rotation;
            initialVisualizationPosition = codeVisualizationRoot.position;
            initialVisualizationRotation = codeVisualizationRoot.rotation;
        }
    }
    
    // Method to be called by XR Grab Interactable
    public void OnGrabEnd()
    {
        isGrabbing = false;
    }
    
    // Method to be called by XR Grab Interactable during grab
    public void OnGrabUpdate(XRBaseInteractor interactor)
    {
        if (isGrabbing && codeVisualizationRoot != null)
        {
            // Move the visualization based on controller movement
            Vector3 positionDelta = interactor.transform.position - initialGrabPosition;
            codeVisualizationRoot.position = initialVisualizationPosition + positionDelta;
            
            // Rotate the visualization based on controller rotation
            Quaternion rotationDelta = interactor.transform.rotation * Quaternion.Inverse(initialGrabRotation);
            codeVisualizationRoot.rotation = rotationDelta * initialVisualizationRotation;
        }
    }
}

```

## Integration Between Components

### 1. Frontend to Backend Communication

The React frontend communicates with the Node.js backend via:
- HTTP requests for API calls
- Socket.IO for real-time updates

### 2. Backend to Unity Communication

The Node.js backend communicates with Unity via:
- WebSockets for real-time data transfer
- File-based communication as a fallback

### 3. Integration Flow

1. **User writes/edits code in the React frontend**
2. **Frontend sends code to backend for processing**
   - Uses Socket.IO to transmit code
   - Backend parses and analyzes the code
3. **Backend sends visualization data to Unity**
   - Primary: WebSocket connection
   - Fallback: Writes to JSON file in a shared location
4. **Unity creates the VR visualization**
   - Receives data via WebSocket or reads from file
   - Instantiates appropriate prefabs for visualization
   - Arranges elements in 3D space for optimal viewing

## XR Configuration

For proper VR setup:

1. In Project Settings > XR Plugin Management:
   - Enable OpenXR
   - Configure supported devices (Oculus, SteamVR, etc.)

2. Add XR Interaction components:
   - XR Origin
   - XR Controller (Left/Right)
   - Teleportation areas for movement

## Build and Deployment for Hackathon

For easy setup during your 2-day hackathon:

1. **Frontend**: Build as static files
   ```
   cd frontend
   npm run build
   ```

2. **Backend**: Set up as a simple Express server
   ```
   cd backend
   npm start
   ```

3. **Unity**: Build for your target VR platform

4. **Run Everything**:
   - Start the backend first
   - Launch the frontend
   - Start the Unity application

This setup gives you a functional codebase for your 2-day hackathon that demonstrates the core concept while leaving room for improvements and extensions.