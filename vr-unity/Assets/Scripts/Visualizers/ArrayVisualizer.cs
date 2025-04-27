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