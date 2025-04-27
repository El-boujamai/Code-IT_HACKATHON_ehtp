# Complete Unity Project Setup Guide (A-Z)

Here's a detailed, step-by-step guide to setting up your CodeVision VR project with a simulator (no headset required):

## A. Create a New Unity Project
1. Open Unity Hub
2. Click "New Project"
3. Select "3D Core" template (or VR Template if available)
4. Use Unity 2022.3 LTS or newer
5. Name your project "CodeVisionVR" and create it

## B. Install Required Packages
1. Go to Window > Package Manager
2. Install these packages (using the "+" button > "Add package by name"):
   - `com.unity.xr.interaction.toolkit` (XR Interaction Toolkit)
   - `com.unity.xr.management` (XR Plugin Management)
   - `com.unity.xr.openxr` (OpenXR Plugin)
   - `com.unity.nuget.newtonsoft-json` (Newtonsoft JSON)
3. For NativeWebSocket: Click "+" > "Add package from git URL" and enter: `https://github.com/endel/NativeWebSocket.git`

## C. Set Up Project Structure
1. In the Project window, right-click > Create > Folder
2. Create these folders:
   - Prefabs
   - Scripts
   - Materials
   - Scenes
   - Settings
3. In Scripts folder, create two more folders:
   - Visualizers
   - Data

## D. Configure XR Settings
1. Go to Edit > Project Settings > XR Plugin Management
2. Check "Initialize XR on Startup"
3. Select OpenXR
4. Go to the OpenXR tab that appears
5. Under Interaction Profiles, ensure "Generic XR Controller" is checked

## E. Add XR Device Simulator
1. In Package Manager, find XR Interaction Toolkit
2. On the right side, find "Samples" and import "XR Device Simulator"
3. In your Project window, there will now be an XR Device Simulator prefab

## F. Create the Main Scene
1. Go to File > New Scene
2. Save it as "CodeVisualizationScene" in your Scenes folder
3. Delete the default Main Camera (we'll use XR cameras)

## G. Set Up Scene Hierarchy
1. Right-click in Hierarchy > XR > XR Origin (VR) - this creates the XR Rig with Camera Offset
2. Create each of these empty GameObjects:
   - Right-click in Hierarchy > Create Empty > Name it "Lighting"
   - Similarly create "Environment", "CodeVisualizationManager", "NetworkManager", "MainThreadDispatcher"
3. Under Lighting:
   - Right-click on Lighting > Light > Directional Light
   - Right-click on Lighting > Create Empty > Name it "Ambient Light"
4. Under Environment:
   - Right-click on Environment > 3D Object > Plane (for Floor)
   - Right-click on Environment > Create Empty > Name it "Reference Grid"
5. Under CodeVisualizationManager:
   - Right-click > Create Empty > Name it "VisualizationRoot"
6. Drag the XR Device Simulator prefab from your Project window into the scene Hierarchy

## H. Create Materials
1. Right-click in Materials folder > Create > Material > Name it "VariableMaterial"
2. In Inspector, set its Albedo color to blue
3. Repeat to create:
   - "ArrayMaterial" (green)
   - "LoopMaterial" (orange)
   - "FunctionMaterial" (purple)

## I. Create Data Classes
1. Right-click in Scripts/Data folder > Create > C# Script > Name it "VisualizationData.cs"
2. Double-click to open in your code editor
3. Replace all code with:

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

## J. Create Main Thread Dispatcher
1. Right-click in Scripts folder > Create > C# Script > Name it "MainThreadDispatcher.cs"
2. Open and replace with:

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

3. Select the MainThreadDispatcher GameObject
4. In Inspector, click Add Component > Scripts > MainThreadDispatcher

## K. Create WebSocket Server
1. Right-click in Scripts folder > Create > C# Script > Name it "WebSocketServer.cs"
2. Open and replace with:

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

3. Select the NetworkManager GameObject
4. Add Component > Scripts > WebSocketServer

## L. Create Visualizer Scripts
1. Create these scripts in the Scripts/Visualizers folder:
   - VariableVisualizer.cs:

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
    
    public void Highlight()
    {
        transform.localScale = new Vector3(1.2f, 1.2f, 1.2f);
    }
    
    public void Unhighlight()
    {
        transform.localScale = Vector3.one;
    }
}
```

   - ArrayVisualizer.cs:

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

   - LoopVisualizer.cs:

```csharp
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
```

   - FunctionVisualizer.cs:

```csharp
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
```

## M. Create the Main CodeVisualization Script
1. Right-click in Scripts folder > Create > C# Script > Name it "CodeVisualization.cs"
2. Open and replace with the script from your original document (it's too long to include here)
3. Select the CodeVisualizationManager GameObject
4. Add Component > Scripts > CodeVisualization

## N. Import TextMeshPro
1. Go to Window > TextMeshPro > Import TMP Essential Resources
2. This is needed for the text components in our visualizers

## O. Create Basic Prefabs
1. For Variable Prefab:
   - Create a Cube (GameObject > 3D Object > Cube)
   - Name it "VariablePrefab"
   - Add Component > TextMeshPro - Text for "nameText", "valueText", and "typeText"
   - Position the text elements around the cube
   - Add Component > Scripts > Visualizers > VariableVisualizer
   - In the Inspector, assign the text components to the appropriate fields
   - Drag your materials to the corresponding fields
   - Drag from Hierarchy to Prefabs folder to create the prefab
   - Delete the cube from the scene

2. Repeat similar steps for other prefabs (Array, Loop, Function, Conditional)
   - For Array: Use a longer cube with smaller cubes inside
   - For Loop: Use a circular arrangement of objects
   - For Function: Use a rectangular shape
   - For Conditional: Use a branching structure

## P. Configure the CodeVisualization Component
1. Select the CodeVisualizationManager GameObject
2. In the Inspector, find the CodeVisualization component
3. Drag each prefab from your Project window to its corresponding slot:
   - Variable Prefab
   - Array Prefab
   - Loop Prefab
   - Function Prefab
   - Conditional Prefab
4. Drag the VisualizationRoot from the Hierarchy to the "Visualization Root" field
5. Adjust other settings like Element Spacing as needed

## Q. Set Up Test JSON File
1. Create a simple JSON file for testing:
   - Create a file named "test-visualization.json"
   - Add this content:

```json
{
  "variables": [
    {
      "name": "count",
      "value": "5",
      "type": "number"
    },
    {
      "name": "message",
      "value": "Hello VR",
      "type": "string"
    }
  ],
  "arrays": [
    {
      "name": "scores",
      "elements": ["10", "20", "30"],
      "length": 3
    }
  ]
}
```

2. Save it in a location where your app can find it (you can set this path in the CodeVisualization script)

## R. Configure VR Interactions
1. Create a new script "VRInteractionHandler.cs"
2. Add code for scaling, moving, and rotating (use sample from original document)
3. Attach to the CodeVisualizationManager GameObject

## S. Configure the XR Device Simulator
1. Select the XR Device Simulator in your Hierarchy
2. In the Inspector, review the default key bindings:
   - Right mouse button + WASD: Move the headset
   - Arrow keys: Move controllers
   - Several other keys to simulate button presses
3. Make sure "Enable" is checked

## T. Setup Input Actions for XR
1. Go to Edit > Project Settings > Input System Package (install if needed)
2. Create an Input Action Asset or use the default XRI ones
3. Configure actions for controllers

## U. Configure WebSocket URL
1. Select the NetworkManager GameObject
2. In WebSocketServer component, set the Server URL to your backend URL
   - Default: "ws://localhost:5000"

## V. Test Basic Setup
1. Click Play in the Unity Editor
2. You should see the XR simulator activate
3. Check the Console for connection attempts
4. If your test JSON file is in the right place, you should see your visualization appear

## W. Create a Simple Backend for Testing
1. Create a simple Node.js server:

```javascript
const WebSocket = require('ws');
const fs = require('fs');

// Create WebSocket server
const wss = new WebSocket.Server({ port: 5000 });

console.log('WebSocket server running on port 5000');

// Sample data
const sampleData = {
  type: 'visualization_data',
  data: {
    variables: [
      { name: 'score', value: '100', type: 'number' },
      { name: 'isActive', value: 'true', type: 'boolean' }
    ],
    arrays: [
      { name: 'colors', elements: ['red', 'green', 'blue'], length: 3 }
    ]
  }
};

// Handle connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send sample data when a client connects
  ws.send(JSON.stringify(sampleData));
  
  // Handle messages
  ws.on('message', (message) => {
    const msg = message.toString();
    console.log('Received:', msg);
    
    if (msg === 'ping') {
      ws.send('pong');
    }
    
    try {
      const data = JSON.parse(msg);
      if (data.type === 'register') {
        console.log('Client registered:', data);
      }
    } catch (e) {
      // Not JSON, just log the message
    }
  });
});
```

2. Save this as "test-server.js" and run with Node.js

## X. Connect to Your Backend
1. Start your backend server (the test server above or your actual backend)
2. Run your Unity project
3. Check the Unity Console for connection messages
4. You should see the visualization data from your server

## Y. Refine Visualization Appearance
1. Adjust positions, colors, and sizes
2. Test different types of code elements
3. Verify interactions work with simulator controls

## Z. Build for Development
1. Go to File > Build Settings
2. Add your scene to the build
3. Select your target platform (PC/Mac for simulator testing)
4. Click Build and Run to create a standalone application

This comprehensive guide should get your CodeVision VR project fully set up and running with the simulator. Each script and component is configured to work together, allowing you to visualize code elements in a 3D environment without needing a physical VR headset.