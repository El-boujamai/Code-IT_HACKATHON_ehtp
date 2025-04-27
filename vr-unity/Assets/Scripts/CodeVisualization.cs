using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Newtonsoft.Json;

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

        // Set the player camera reference
        if (playerCamera == null)
        {
            playerCamera = Camera.main.transform;
        }

        // Path to look for data file
        dataFilePath = Path.Combine(Application.persistentDataPath, "current-visualization.json");
        Debug.Log($"Looking for visualization data at: {dataFilePath}");

        // Set up WebSocket listener
        WebSocketServer.OnMessageReceived += ProcessWebSocketMessage;

        // Set up periodic checking for file changes
        InvokeRepeating("CheckForVisualizationData", 2.0f, 1.0f);

        // Create a test visualization (comment this out in production)
        CreateTestData();
    }

    void ProcessWebSocketMessage(string message)
    {
        try
        {
            // Parse the incoming message
            Dictionary<string, object> msgData = JsonConvert.DeserializeObject<Dictionary<string, object>>(message);

            if (msgData.ContainsKey("type") && msgData["type"].ToString() == "visualization_data")
            {
                string dataJson = JsonConvert.SerializeObject(msgData["data"]);
                var data = JsonConvert.DeserializeObject<VisualizationData>(dataJson);

                // ✅ Inject codeId if it's missing
                if (string.IsNullOrEmpty(data.codeId) && msgData["data"] is Dictionary<string, object> rawData && rawData.ContainsKey("codeId"))
                {
                    data.codeId = rawData["codeId"].ToString();
                }

                CreateVisualization(data);
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

                if (data == null)
                {
                    Debug.LogWarning("Deserialized visualization data is null.");
                    return;
                }
                // Create visualization based on data
                CreateVisualization(data);

                Debug.Log("Created visualization from file data");

                // Remove file after processing
                File.Delete(dataFilePath);
            }
            catch (Exception e)
            {
                Debug.LogError("Error reading visualization data: " + e.Message);
            }
        }
    }

    // For testing - creates sample data
    void CreateTestData()
    {
        VisualizationData testData = new VisualizationData
        {
            variables = new List<VariableData>
            {
                new VariableData { name = "counter", value = "5", type = "number" },
                new VariableData { name = "name", value = "John", type = "string" }
            },
            arrays = new List<ArrayData>
            {
                new ArrayData
                {
                    name = "numbers",
                    elements = new List<string> { "1", "2", "3", "4", "5" },
                    length = 5
                }
            },
            loops = new List<LoopData>
            {
                new LoopData { type = "for", variable = "i" }
            },
            functions = new List<FunctionData>
            {
                new FunctionData
                {
                    name = "calculateTotal",
                    @params = new List<string> { "price", "quantity" }
                }
            }
        };

        // Save to file for testing file reading
        string json = JsonConvert.SerializeObject(testData, Formatting.Indented);
        File.WriteAllText(dataFilePath, json);

        // Create visualization directly
        CreateVisualization(testData);
    }

    void CreateVisualization(VisualizationData data)
    {
        // Clear previous visualization
        ClearVisualization();

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

            var visManager = FindFirstObjectByType<VisualizationManager>();
            if (visManager != null)
            {
                visManager.UpdateVisualization(data.codeId ?? "default_code");
            }
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

        // Also destroy any other children
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
                visualizer.SetVariable(variable.name, variable.value, variable.type);
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
            Vector3 position = new Vector3(startX, startY + (i * 2), 0);

            GameObject functionObj = Instantiate(functionPrefab, position, Quaternion.identity, functionsParent.transform);
            functionObj.name = "Function_" + function.name;

            // Set up function visualization
            var visualizer = functionObj.GetComponent<FunctionVisualizer>();
            if (visualizer != null)
            {
                visualizer.SetFunction(function.name, function.@params);
            }

            visualElements[function.name] = functionObj;
        }
    }

    private void OnDestroy()
    {
        // Remove listener
        WebSocketServer.OnMessageReceived -= ProcessWebSocketMessage;
    }
}