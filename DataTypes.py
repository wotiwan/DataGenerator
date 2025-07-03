from faker import Faker
import numpy as np
import json
import random
from collections import Counter
import geopandas as gpd
from shapely.geometry import Point
from scipy.stats import gamma
from scipy.optimize import minimize_scalar


class IdGenerator:
    def __init__(self, config_file, n_rows):
        self.config = config_file
        self.n = n_rows

    def generate_column(self):
        ids = []
        for i in range(self.n):
            ids.append(i+1)
        return ids


class NameGenerator:
    def __init__(self, config_file, n_rows):
        self.config = config_file
        self.n = n_rows
        self.fake = Faker('ru_RU')

    def generate_column(self):
        names = []
        for i in range(self.n):
            method = f"{self.config['type']}{self.config['gender']}"
            names.append(getattr(self.fake, method)())
        return names


class EmailGenerator:
    def __init__(self, config_file, n_rows):
        self.config = config_file
        self.n = n_rows
        self.fake = Faker('ru_RU')

    def generate_column(self):
        emails = []
        for i in range(self.n):
            emails.append(self.fake.email())
        return emails


class AddressGenerator:
    def __init__(self, config_file, n_rows):
        self.config = config_file
        self.n = n_rows
        self.fake = Faker('ru_RU')

    def generate_column(self):
        addresses = []
        for i in range(self.n):
            addresses.append(self.fake.city() + ", " + self.fake.street_address())
        return addresses


class NumbersGenerator:
    def __init__(self, config_file, n_rows):
        self.config = config_file
        self.n = n_rows
        self.type = self.config["num_type"]
        self.distribution = self.config["distribution"]
        self.min = config_file["min"]
        self.max = config_file["max"]
        self.avg = config_file["avg"]
        self.std = config_file["std"]
        self.missing_values = config_file["missing_values"]

    def generate_column(self):
        numbers = []

        if self.distribution == "normal":
            num = np.random.normal(self.avg, self.std, size=self.n)
        elif self.distribution == "uniform":
            num = np.random.uniform(low=self.min, high=self.max, size=self.n)
        else:
            raise Exception("Unsupported distribution type!")

        num = np.clip(num, self.min, self.max)  # Ограничиваем полуенные данные, округляя до границ диапазонов
        num[np.random.choice(self.n, int(self.n * self.missing_values))] = np.nan  # Пропуски значений
        # TODO: добавить выбросы
        for i in num:
            if self.type == "discrete":
                numbers.append(float(i - (i % 1)))
            elif self.type == "continuous":
                numbers.append(float(i))
        return numbers


class DogBreedGenerator:  # Создание колонки с случайными породами
    def __init__(self, config_file, n_rows):
        self.config = config_file
        self.n = n_rows
        self.dependencies_file = json.load(open("dependencies.json", "r", encoding="UTF-8"))
        self.breeds = list(self.dependencies_file["breed"].keys())  # Список пород

    def generate_column(self):
        breeds_list = []
        for i in range(self.n):
            breeds_list.append(random.choice(self.breeds))  # Добавляем случайную породу из списка
        return breeds_list


class DogAgeGenerator:  # Зависит у собак например от породы
    def __init__(self, config_file, n_rows, breed_column):
        self.config = config_file
        self.n = n_rows
        self.breeds_list = breed_column
        self.breeds = Counter(self.breeds_list)
        self.dependencies_file = json.load(open("dependencies.json", "r", encoding="UTF-8"))
        print(self.breeds)  # len = 2
        # Нужно пройтись по всем представленным породам. Внутри породы создаём норм распределение.
        # Затем создаём цикл и присваиваем всем колонкам где есть эта порода её число из распределения.
        self.distribution = self.config["distribution"]

    def generate_column(self):
        ages = [0] * self.n

        for breed in self.breeds:
            breed_count = self.breeds[breed]  # Кол-во особей этой породы
            avg_age = self.dependencies_file["breed"][breed]["age"]
            if self.distribution == "normal":
                std = avg_age * 0.3  # условно 30% от среднего — стандартное отклонение
                age = np.random.normal(loc=avg_age / 2, scale=std, size=breed_count)
                age = np.clip(age, 0, avg_age + 2)
            elif self.distribution == "uniform":
                age = np.random.uniform(0, avg_age, size=breed_count)
            else:
                raise ValueError(f"Unsupported distribution type!")

            age_list = []  # Перемещаем это дело в обычный массив, чтобы можно было делать .pop
            for i in age:
                age_list.append(i)

            for i in range(len(self.breeds_list)):
                if breed in self.breeds_list[i]:
                    ages[i] = age_list.pop()
                    ages[i] = ages[i] - ages[i] % 1
            # TODO: Отсюда запускаем расчёт веса соответственно
        return ages


# class DogWeightGenerator:
#     def __init__(self, config_file, n_rows, breed, age):


class BaikalLightningGenerator:  # Генерируем координаты
    def __init__(self, config_file, n_rows):
        self.config = config_file
        self.n = n_rows
        self.gdf = gpd.read_file("Baikal_region.shp")

    def generate_column(self):
        if self.gdf.crs is None:
            self.gdf.set_crs(epsg=3857, inplace=True)  # Или нужная тебе проекция
        gdf = self.gdf.to_crs(epsg=4326)
        region = gdf.union_all()  # Объединим в один полигон, если их несколько

        coords = []
        for i in range(self.n):
            coords.append(self.generate_coord(region))
        return coords

    def generate_coord(self, polygon):
        minx, miny, maxx, maxy = polygon.bounds

        while True:
            x = random.uniform(minx, maxx)
            y = random.uniform(miny, maxy)
            point = Point(x, y)
            if polygon.contains(point):
                return (round(y, 6), round(x, 6))  # lat, lng


class RainfallGenerator:
    def __init__(self, config_file, n_rows):
        self.config = config_file
        self.n = n_rows
        self.shape = 2
        self.threshold = 2.5
        self.missing_values = config_file["missing_values"]

    def generate_column(self):
        rainfall_list = []
        res = minimize_scalar(self.objective, bounds=(0.1, 5), method='bounded')
        best_scale = res.x
        trunc_gamma = TruncatedGamma(a=2, scale=best_scale, upper=25)
        data = trunc_gamma.rvs(self.n)
        data[np.random.choice(self.n, int(self.n * self.missing_values))] = np.nan  # Пропуски значений
        for i in data:
            rainfall_list.append(round(i, 1))  # 1 знак после запятой, поменять при необходимости
        return rainfall_list

    def objective(self, scale):
        if scale <= 0:
            return 1e6
        return abs(gamma.cdf(self.threshold, a=self.shape, scale=scale) - 0.1)


class TruncatedGamma:  # Вызывается в RainfallGenerator
    def __init__(self, a, scale, upper):
        self.a = a
        self.scale = scale
        self.upper = upper
        self.cdf_upper = gamma.cdf(upper, a, scale=scale)

    def rvs(self, size):
        u = np.random.uniform(0, self.cdf_upper, size)
        return gamma.ppf(u, self.a, scale=self.scale)

    def pdf(self, x):
        base_pdf = gamma.pdf(x, self.a, scale=self.scale)
        return base_pdf / self.cdf_upper * ((x >= 0) & (x <= self.upper))


class LightningTypeGenerator:  # Логический. Сухая ли гроза?
    def __init__(self, config_file, n_rows, rainfall_column):
        self.config = config_file
        self.n = n_rows
        self.rainfalls_list = rainfall_column

    def generate_column(self):
        types = []
        for i in self.rainfalls_list:
            if i <= 2.5:
                types.append(1)
            else:
                types.append(0)
        return types


class LightningTerrainGenerator:  # Учитывает тип сухость чтобы выбрать тип поверхности
    def __init__(self, config_file, n_rows, rainfall_column):
        self.config = config_file
        self.n = n_rows
        self.rainfalls = rainfall_column
        self.terrain_type_1 = ["Вырубка", "Поле", "Редколесье"]  # чаще для сухих гроз
        self.terrain_type_2 = ["Хвойный лес", "Смешанный лес", "Кустарники", "Широколиственный"]

    def generate_column(self):
        terrains = []
        for i in self.rainfalls:
            if i <= 2.5:  # сухой
                k = random.random()
                if k > 0.7:
                    terrains.append(random.choice(self.terrain_type_2))  # 30% что плотнозасажен
                else:
                    terrains.append(random.choice(self.terrain_type_1))  # 70% что редколиственный
            else:
                temp_list = self.terrain_type_1 + self.terrain_type_2
                terrains.append(random.choice(temp_list))
        return terrains


class CategoricalGenerator:
    def __init__(self, config_file, n_rows):
        self.config = config_file
        self.n = n_rows
        self.values = config_file["values"]

    def generate_column(self):
        print(self.values)
        categories = []
        names, probabilities = zip(*self.values)
        for i in range(self.n):
            categories.append(random.choices(names, weights=probabilities)[0])
        return categories

















# class ColumnGenerator:
#     def __init__(self, config_file, n_rows):
#         self.config = config_file
#         self.n = n_rows
#     def generate(self):
#         pass