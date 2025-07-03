import json
from faker import Faker
import pandas as pd
from DataTypes import *
import time


class DataGenerator:
    def __init__(self, config_file, n_rows):
        self.config = config_file  # json config file from frontend
        self.n = n_rows  # rows number

    def generate(self):
        data = {}
        for i in self.config["columns"]:
            column_name = i["name"]
            column_type = i["type"]
            if column_type == "id":
                data[column_name] = IdGenerator(i, self.n).generate_column()
                print(data[column_name])
            elif column_type in ["name", "first_name", "middle_name", "last_name"]:
                data[column_name] = NameGenerator(i, self.n).generate_column()
                print(data[column_name])
            elif column_type == "email":
                data[column_name] = EmailGenerator(i, self.n).generate_column()
                print(data[column_name])
            elif column_type == "address":
                data[column_name] = AddressGenerator(i, self.n).generate_column()
                print(data[column_name])
            elif column_type == "number":
                data[column_name] = NumbersGenerator(i, self.n).generate_column()
                print(data[column_name])
            elif column_type == "dog_breed":
                data[column_name] = DogBreedGenerator(i, self.n).generate_column()
                print(data[column_name])
            elif column_type == "age":
                data[column_name] = DogAgeGenerator(i, self.n, data[i["depends_on"]]).generate_column()
                print(data[column_name])
            elif column_type == "lightning":
                data[column_name] = BaikalLightningGenerator(i, self.n).generate_column()
                print(data[column_name])
            elif column_type == "rainfall":
                data[column_name] = RainfallGenerator(i, self.n).generate_column()
                print(data[column_name])
            elif column_type == "lightning_type":
                data[column_name] = LightningTypeGenerator(i, self.n, data[i["depends_on"]]).generate_column()
                print(data[column_name])
            elif column_type == "lightning_terrain":
                data[column_name] = LightningTerrainGenerator(i, self.n, data[i["depends_on"]]).generate_column()
                print(data[column_name])
            elif column_type == "categorical":
                data[column_name] = CategoricalGenerator(i, self.n).generate_column()
                print(data[column_name])

        df = pd.DataFrame(data)
        filename = f"cache/{time.time()}.csv"
        df.to_csv(filename, index=False)

        return filename


# f = open("config.json", "r", encoding='utf-8')
# data = json.load(f)
# filename = data["table_name"]
# rows_count = data["n_rows"]
# gen = DataGenerator(data, rows_count).generate()
